// components/Notification.tsx
"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    // Set a timer to dismiss the notification
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    // Clean up the timer if the component is unmounted
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onDismiss]);

  return (
    <div
      style={{ top: "30%" }}
      className=" no-print fixed left-1/2 -translate-x-1/2 z-50 bg-white h-[80px] text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-lg flex items-center"
    >
      {message}
    </div>
  );
};

export default Notification;
