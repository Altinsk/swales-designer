import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useEffect, useRef } from "react";
import GoogleIcon from "./GoogleIcon";

function GoogleLogin({ onClose }) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const { login } = useAuth();
  const pendingListenerRef = useRef<((event: any) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (pendingListenerRef.current) {
        window.removeEventListener("message", pendingListenerRef.current);
        pendingListenerRef.current = null;
      }
    };
  }, []);
  const googleSignin = async (firstName, email, authToken) => {
    try {
      const response = await axios.post(API_URL + "/auth/google-signin", {
        firstName,
        email,
        authToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const handleGoogleSignIn = async (e, setLoading) => {
    e.preventDefault();
    // setLoading(true);

    try {
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

      const handleMessage = async (event) => {
        if (event.origin !== window.origin) return;
        if (!event.data) return;

        if (event.data.type === "google-auth-success") {
          window.removeEventListener("message", handleMessage);
          pendingListenerRef.current = null;

          const { getSession } = await import("next-auth/react");
          const session = await getSession();

          if (session?.user) {
            const { name, email, token } = session.user;
            const res = await googleSignin(name, email, token);

            if (res.success) {
              login(res.data.accessToken);
              onClose();
              localStorage.setItem("accessToken", res.data.accessToken);
              localStorage.setItem("userName", res.data.userName);
              //   window.location.href = process.env.NEXT_PUBLIC_APP_BASE_URL;
              sessionStorage.setItem("userName", res.data.userName);
            } else {
              setTimeout(() => window.location.reload(), 3000);
            }
          }

          //   setLoading(false);
        }
      };
      pendingListenerRef.current = handleMessage;
      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("Google Sign-In failed:", error);

      //   setLoading(false);
    } finally {
      setTimeout(() => {
        // setLoading(false);
      }, 5000);
    }
  };

  return (
    <button
      className="google-btn"
      onClick={(e) => {
        handleGoogleSignIn(e, null);
      }}
    >
      Continue with Google
      <GoogleIcon />
    </button>
  );
}

export default GoogleLogin;
