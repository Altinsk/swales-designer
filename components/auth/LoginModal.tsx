"use client";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.success) {
        login(res.data.data.accessToken);
        onClose();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Sign In
        </button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

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
