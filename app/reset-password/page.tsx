"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react"; // Import icons

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Password validation utility function
export const validatePassword = (password = "") => {
  if (typeof password !== "string") return false; // Ensure input is a string
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{8,}$/;
  return re.test(password);
};

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid or missing reset token. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // 1. Validate password strength
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (@$!%*#?&^)."
      );
      return;
    }

    // 2. Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 3. Check for token
    if (!token) {
      setError("No reset token found. Please request a new link.");
      return;
    }

    setSuccessMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/auth/reset-password`,
        { token, newPassword: password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccessMessage(
          "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "An error occurred. The token may be invalid or expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header nologin={true} />
      <div
        className="max-w-md mx-auto mt-10 p-6    rounded-lg shadow-lg bg-white"
        style={{ border: "1px solid #8080802e" }}
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || !!successMessage}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10" // Added pr-10 for icon
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || !!successMessage}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10" // Added pr-10 for icon
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={!token || isLoading || !!successMessage}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </>
  );
};

// Use Suspense to handle the client-side reading of search params
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
