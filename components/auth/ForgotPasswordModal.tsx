"use client";
import React, { useState } from "react";
import axios from "axios";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void; // To go back to the login modal
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const validateEmail = (email = "") => {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const borderClass = emailError
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : email
    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
    : "border-gray-300 focus:border-green-500 focus:ring-green-500";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError("");

    if (!value.trim()) {
      setEmailError("This field can't be empty.");
    } else if (!validateEmail(value)) {
      setEmailError("Please provide a valid email.");
    } else {
      setEmailError("");
    }
  };

  const handleBlur = () => {
    if (!email.trim()) {
      setEmailError("This field can't be empty.");
    }
  };

  const validateForm = () => {
    if (!email) {
      setEmailError("Please provide your email address.");
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError(
        "The email address entered is not valid. Please check and try again."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

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
      <h2 className="text-xl font-semibold text-center text-[#262626]">
        Reset Password
      </h2>
      <p className="text-sm text-center text-[#525252]">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#404040]">
            Email
          </label>
          <input
            type="text"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${borderClass}`}
          />
          {emailError && (
            <p className="text-sm text-red-600 mt-1">{emailError}</p>
          )}
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
      <p className="text-center text-sm text-[#525252]">
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
