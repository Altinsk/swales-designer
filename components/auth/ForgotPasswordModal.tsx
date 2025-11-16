"use client";
import React, { useState } from "react";
import axios from "axios";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void; // To go back to the login modal
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/auth/forgot-password`,
        // The 'source' param is from your backend's emailService
        { email, source: "garden" },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccessMessage("Reset link sent. Please check your email inbox.");
        setEmail(""); // Clear the input field
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center text-gray-800">
        Reset Password
      </h2>
      <p className="text-sm text-center text-gray-600">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        {" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium  hover:text-green-500"
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordModal;
