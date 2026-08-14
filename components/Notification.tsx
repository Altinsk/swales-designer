// components/Notification.tsx
"use client";

import { useEffect, useRef } from "react";

interface NotificationProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  duration = 3000,
  onDismiss,
}) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    // Set a timer to dismiss the notification. Only depends on message/duration
    // so an unrelated parent re-render (e.g. while dragging on the canvas)
    // doesn't restart the countdown via a fresh inline onDismiss reference.
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, duration);

    // Clean up the timer if the component is unmounted
    return () => {
      clearTimeout(timer);
    };
  }, [duration, message]);

  return (
    <div
      style={{ top: "30%" }}
      className=" no-print fixed left-1/2 -translate-x-1/2 z-50 bg-white h-[120px] md:h-[80px] text-[#262626] font-semibold py-2 px-6 rounded-lg shadow-lg flex items-center"
    >
      {message}
    </div>
  );
};

export default Notification;
