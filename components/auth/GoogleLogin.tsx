import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import GoogleIcon from "./GoogleIcon";
import { getApiErrorMessage } from "./authFeedback";

function GoogleLogin({ onClose }) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const { login } = useAuth();
  const pendingListenerRef = useRef<((event: any) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (pendingListenerRef.current) {
        window.removeEventListener("message", pendingListenerRef.current);
        pendingListenerRef.current = null;
      }
    };
  }, []);
  const googleSignin = async (firstName, email, authToken) => {
    const response = await axios.post(
      API_URL + "/auth/google-signin",
      { firstName, email, authToken },
      { withCredentials: true },
    );
    return response.data;
  };
  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    // Guards the popup/listener race: without this, clicking again while a
    // sign-in is already in flight replaces pendingListenerRef with a new
    // listener, so a message from the first (still-open) popup would be
    // handled as if it belonged to the second attempt.
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    if (pendingListenerRef.current) {
      window.removeEventListener("message", pendingListenerRef.current);
      pendingListenerRef.current = null;
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth-popup-complete`;

    const popup = window.open(
      `/api/auth/signin/google?prompt=select_account&callbackUrl=${encodeURIComponent(
        callbackUrl
      )}`,
      "GoogleAuthPopup",
      `width=500,height=600,top=${window.innerHeight / 2 - 300},left=${
        window.innerWidth / 2 - 250
      }`
    );

    if (!popup) {
      setError(
        "Your browser blocked the Google sign-in popup. Please allow popups for this site and try again."
      );
      setIsLoading(false);
      return;
    }

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) return;

      if (event.data.type === "google-auth-success") {
        window.removeEventListener("message", handleMessage);
        pendingListenerRef.current = null;

        // googleSignin() throws on any non-2xx response (axios's default),
        // so this used to be an unhandled rejection inside an async message
        // listener - no catch anywhere caught it, meaning any real failure
        // (invalid/expired Google token, unverified email, rate limit,
        // network error) surfaced no feedback to the user at all, not even
        // the "reload after 3s" fallback that was only reachable for a
        // success:false-with-200 response the backend never actually sends.
        try {
          const { getSession } = await import("next-auth/react");
          const session = await getSession();

          if (!session?.user) {
            throw new Error(
              "Google sign-in did not return a session. Please try again."
            );
          }

          const { name, email, token } = session.user;
          await googleSignin(name, email, token);
          await login();
          onClose();
        } catch (err) {
          setError(
            getApiErrorMessage(err, "Google sign-in failed. Please try again.")
          );
        } finally {
          setIsLoading(false);
        }
      }
    };
    pendingListenerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);
  };

  return (
    <>
      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Continue with Google"}
        <GoogleIcon />
      </button>
      {error && (
        <p role="alert" className="validation">
          {error}
        </p>
      )}
    </>
  );
}

export default GoogleLogin;
