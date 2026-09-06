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
      showPassword ? "text-green-600" : "text-[#a3a3a3]"
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

// "Special character" means any non-letter, non-digit, non-space character -
// not a narrow allowlist. Previously restricted to only @$!%*#?&^, which
// silently rejected an otherwise-valid password containing e.g. a period.
const validatePasswordRule = (password = "") => {
  if (typeof password !== "string") return false;
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;
  return re.test(password);
};

const PASSWORD_HINT =
  "8+ characters, with uppercase, lowercase, a number, and a symbol with no spaces";

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

  // --- Field-level Errors ---
  const [profileErrors, setProfileErrors] = useState({
    firstName: "",
    lastName: "",
  });
  const [passErrors, setPassErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fieldBorderClass = (value: string, error: string) =>
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : value
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:border-green-500 focus:ring-green-500";

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
        setProfileErrors({ firstName: "", lastName: "" });
        setPassErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    };

    fetchUserData();
  }, [isOpen]);

  const { login } = useAuth();

  if (!isOpen) return null;

  // --- Handlers ---

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    setMessages({ error: "", success: "" });

    if (name === "firstName" || name === "lastName") {
      setProfileErrors((prev) => ({
        ...prev,
        [name]: value.trim() ? "" : "This field can't be empty.",
      }));
    }
  };

  const handleProfileBlur = (field: "firstName" | "lastName") => {
    if (!profileData[field].trim()) {
      setProfileErrors((prev) => ({
        ...prev,
        [field]: "This field can't be empty.",
      }));
    }
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
    const { name, value } = e.target;
    const newPassData = { ...passData, [name]: value };
    setPassData(newPassData);
    setMessages({ error: "", success: "" });

    let fieldError = "";
    if (!value) {
      fieldError = "This field can't be empty.";
    } else if (name === "newPassword" && !validatePasswordRule(value)) {
      fieldError = PASSWORD_HINT;
    } else if (
      name === "confirmPassword" &&
      value !== newPassData.newPassword
    ) {
      fieldError = "New passwords do not match.";
    }

    setPassErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handlePassBlur = (
    field: "currentPassword" | "newPassword" | "confirmPassword"
  ) => {
    if (!passData[field]) {
      setPassErrors((prev) => ({
        ...prev,
        [field]: "This field can't be empty.",
      }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages({ error: "", success: "" });

    const newProfileErrors = {
      firstName: profileData.firstName.trim()
        ? ""
        : "This field can't be empty.",
      lastName: profileData.lastName.trim()
        ? ""
        : "This field can't be empty.",
    };
    setProfileErrors(newProfileErrors);
    if (newProfileErrors.firstName || newProfileErrors.lastName) return;

    try {
      const res = await axios.put(
        `${API_URL}/auth/update-profile`,

        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
            : null,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        // The backend reissued the session cookie with the updated details -
        // re-sync `user` from it.
        await login();
        setMessages({
          error: "",
          success: "Profile details updated successfully.",
        });
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

    const newPassErrors = {
      currentPassword: !passData.currentPassword
        ? "This field can't be empty."
        : "",
      newPassword: !passData.newPassword
        ? "This field can't be empty."
        : !validatePasswordRule(passData.newPassword)
        ? PASSWORD_HINT
        : "",
      confirmPassword: !passData.confirmPassword
        ? "This field can't be empty."
        : passData.newPassword !== passData.confirmPassword
        ? "New passwords do not match."
        : "",
    };
    setPassErrors(newPassErrors);
    if (
      newPassErrors.currentPassword ||
      newPassErrors.newPassword ||
      newPassErrors.confirmPassword
    )
      return;

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
        setPassErrors({
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
          <h2 className="text-xl font-semibold text-[#262626]">
            Account Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#404040]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <p className="text-[#737373]">Loading your details...</p>
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
                className="text-lg font-medium text-[#171717] pb-2"
                style={{ borderBottom: "1px solid #8080802e" }}
              >
                Personal Information
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#404040]">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    onBlur={() => handleProfileBlur("firstName")}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${fieldBorderClass(
                      profileData.firstName,
                      profileErrors.firstName
                    )}`}
                  />
                  {profileErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#404040]">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    onBlur={() => handleProfileBlur("lastName")}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${fieldBorderClass(
                      profileData.lastName,
                      profileErrors.lastName
                    )}`}
                  />
                  {profileErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#404040]">
                  Email (Cannot be changed)
                </label>
                <input
                  name="email"
                  value={profileData.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-[#737373] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#404040] mb-1">
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
                className="text-lg font-medium text-[#171717]  pb-2"
                style={{ borderBottom: "1px solid #8080802e" }}
              >
                Change Password
              </h3>

              {/* Current Password */}
              <div>
                <div className="relative">
                  <input
                    name="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    placeholder="Current Password"
                    value={passData.currentPassword}
                    onChange={handlePassChange}
                    onBlur={() => handlePassBlur("currentPassword")}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none pr-10 ${fieldBorderClass(
                      passData.currentPassword,
                      passErrors.currentPassword
                    )}`}
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
                {passErrors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <div className="relative">
                  <input
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    placeholder="New Password"
                    value={passData.newPassword}
                    onChange={handlePassChange}
                    onBlur={() => handlePassBlur("newPassword")}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none pr-10 ${fieldBorderClass(
                      passData.newPassword,
                      passErrors.newPassword
                    )}`}
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
                {passErrors.newPassword ? (
                  <p className="text-sm text-red-600 mt-1">
                    {passErrors.newPassword}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">{PASSWORD_HINT}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={passData.confirmPassword}
                    onChange={handlePassChange}
                    onBlur={() => handlePassBlur("confirmPassword")}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none pr-10 ${fieldBorderClass(
                      passData.confirmPassword,
                      passErrors.confirmPassword
                    )}`}
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
                {passErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passErrors.confirmPassword}
                  </p>
                )}
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
