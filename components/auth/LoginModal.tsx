"use client";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import GoogleLogin from "./GoogleLogin";
import { getApiErrorMessage, Spinner } from "./authFeedback";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToSignup,
  onSwitchToForgot,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        await login(res.data.data.accessToken);
        onClose();
        return;
      }
      // Server answered 2xx but rejected the login
      setError(res.data.message || "Invalid email or password.");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "An error occurred during login."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Forgot password?
            </button>
          </div>
        </div>
        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading && <Spinner />}
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      <GoogleLogin onClose={onClose} />
      <p className="text-center text-sm text-gray-600">
        No account?{" "}
        <button
          onClick={onSwitchToSignup}
          className="font-medium text-green-600 hover:text-green-500"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};
export default LoginModal;
