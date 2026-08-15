"use client";

import { useEffect } from "react";

export default function AuthPopupComplete() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: "google-auth-success" }, window.location.origin);
      window.close();
    }
  }, []);

  return <div>Authenticating...</div>;
}
