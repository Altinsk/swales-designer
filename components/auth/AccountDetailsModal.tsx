"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid } from "date-fns";
import { X, Loader2 } from "lucide-react"; // Added Loader icon
import { useAuth } from "@/context/AuthContext";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // removed 'user' prop requirement for data filling
}

// Reusing Icon
const PasswordIcon = ({
  onClick,
  showPassword,
}: {
  onClick: () => void;
  showPassword?: boolean;
}) => (
  <svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-5 h-5 cursor-pointer ${
      showPassword ? "text-green-600" : "text-gray-400"
    }`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-4.418a1.012 1.012 0 011.415 0l4.418 4.418a1.012 1.012 0 010 1.415l-4.418 4.418a1.012 1.012 0 01-1.415 0l-4.418-4.418z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const validatePasswordRule = (password = "") => {
  if (typeof password !== "string") return false;
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{8,}$/;
  return re.test(password);
};

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: null as Date | null,
  });

  // --- Password State ---
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [messages, setMessages] = useState({ error: "", success: "" });

  // Fetch data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen) {
        setIsLoading(true);
        setMessages({ error: "", success: "" });
        try {
          // Use the new endpoint
          const res = await axios.get(`${API_URL}/auth/me`, {
            withCredentials: true,
          });

          if (res.data.success) {
            const data = res.data.data;
            setProfileData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            });
          }
        } catch (err: any) {
          setMessages({
            error: "Failed to load user details. Please try again.",
            success: "",
          });
        } finally {
          setIsLoading(false);
        }

        // Reset password fields
        setPassData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    };

    fetchUserData();
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---

  const { login } = useAuth();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setMessages({ error: "", success: "" });
  };

  const handleDateChange = (date: Date | null) => {
    console.log(date);

    if (date && isValid(date)) {
      setProfileData((prev) => ({ ...prev, dateOfBirth: date }));
    } else {
      setProfileData((prev) => ({ ...prev, dateOfBirth: null }));
    }
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
    setMessages({ error: "", success: "" });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages({ error: "", success: "" });

    try {
      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
          : null,
      };

      const res = await axios.put(
        `${API_URL}/auth/update-profile`,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
            : null,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setMessages({
          error: "",
          success: "Profile details updated successfully.",
        });
        if (res.data.data.accessToken) {
          login(res.data.data.accessToken);
        }
      }
    } catch (err: any) {
      setMessages({
        error: err.response?.data?.message || "Failed to update profile.",
        success: "",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages({ error: "", success: "" });

    if (!passData.currentPassword) {
      setMessages({ error: "Current password is required.", success: "" });
      return;
    }
    if (!validatePasswordRule(passData.newPassword)) {
      setMessages({
        error:
          "New password must be 8+ chars with upper, lower, number & special char.",
        success: "",
      });
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      setMessages({ error: "New passwords do not match.", success: "" });
      return;
    }

    try {
      const payload = {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      };

      const res = await axios.put(`${API_URL}/auth/change-password`, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        setMessages({ error: "", success: "Password changed successfully." });
        setPassData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      setMessages({
        error: err.response?.data?.message || "Failed to change password.",
        success: "",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      style={{ zIndex: "9999999" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div
          className="flex justify-between items-center p-4 "
          style={{ borderBottom: "1px solid #8080802e" }}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            Account Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <p className="text-gray-500">Loading your details...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Status Messages */}
            {messages.error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                {messages.error}
              </div>
            )}
            {messages.success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded">
                {messages.success}
              </div>
            )}

            {/* --- SECTION 1: Personal Information --- */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h3
                className="text-lg font-medium text-gray-900 pb-2"
                style={{ borderBottom: "1px solid #8080802e" }}
              >
                Personal Information
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (Cannot be changed)
                </label>
                <input
                  name="email"
                  value={profileData.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <DatePicker
                  selected={profileData.dateOfBirth}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Update Profile
              </button>
            </form>

            {/* --- SECTION 2: Change Password --- */}
            <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
              <h3
                className="text-lg font-medium text-gray-900  pb-2"
                style={{ borderBottom: "1px solid #8080802e" }}
              >
                Change Password
              </h3>

              {/* Current Password */}
              <div className="relative">
                <input
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Current Password"
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <PasswordIcon
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        current: !showPassword.current,
                      })
                    }
                    showPassword={showPassword.current}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  placeholder="New Password"
                  value={passData.newPassword}
                  onChange={handlePassChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <PasswordIcon
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    showPassword={showPassword.new}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={passData.confirmPassword}
                  onChange={handlePassChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <PasswordIcon
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    showPassword={showPassword.confirm}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailsModal;
