"use client";
import React, { useState } from "react";
import axios from "axios";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const SignupModal: React.FC<SignupModalProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSuccessMessage(res.data.message + ". You can now log in.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during sign up."
      );
    }
  };

  if (successMessage) {
    return (
      <div className="p-4 text-center space-y-4">
        <p className="text-green-600">{successMessage}</p>
        <button
          onClick={onSwitchToLogin}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Create Account
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-green-600 hover:text-green-500"
        >
          Login
        </button>
      </p>
    </div>
  );
};
export default SignupModal;
