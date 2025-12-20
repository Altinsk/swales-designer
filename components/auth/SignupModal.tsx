"use client";
import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Styles for DatePicker
import { isValid } from "date-fns";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// A simple SVG icon for password visibility. You can replace this with your own component.
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

/**
 * Validates password based on the following rules:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (@$!%*#?&^)
 */
export const validatePassword = (password = "") => {
  if (typeof password !== "string") return false; // Ensure input is a string
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{8,}$/;
  return re.test(password);
};

const SignupModal: React.FC<SignupModalProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: null as Date | null,
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Use an object for errors to handle each field individually
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
    form: "", // For general form errors from the API
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the specific error when the user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const today = new Date();
      const tenYearsAgo = new Date(
        today.getFullYear() - 10,
        today.getMonth(),
        today.getDate()
      );

      if (date <= tenYearsAgo) {
        setFormData((prev) => ({ ...prev, dateOfBirth: date }));
        setFormErrors((prev) => ({ ...prev, dateOfBirth: "" }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          dateOfBirth: "You must be at least 10 years old.",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, dateOfBirth: null }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.firstName) errors.firstName = "First name is required.";
    if (!formData.lastName) errors.lastName = "Last name is required.";
    if (!formData.email) errors.email = "Email is required.";
    if (!formData.dateOfBirth)
      errors.dateOfBirth = "Date of birth is required.";

    // --- Updated Password Validation ---
    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (!validatePassword(formData.password)) {
      errors.password =
        "Password must be 8+ characters and include uppercase, lowercase, a number, and a special character (@$!%*#?&^).";
    }
    // --- End of Update ---

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({} as any); // Clear previous errors

    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        // Format date for the backend if needed, e.g., to 'YYYY-MM-DD'
        dateOfBirth: formData.dateOfBirth?.toISOString().split("T")[0],
        src: "designer",
      };

      const res = await axios.post(`${API_URL}/auth/register`, payload, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSuccessMessage(res.data.message + ". You can now log in.");
      }
    } catch (err: any) {
      setFormErrors((prev) => ({
        ...prev,
        form:
          err.response?.data?.message || "An error occurred during sign up.",
      }));
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
        {/* First and Last Name */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full">
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                formErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.firstName && (
              <p className="text-xs text-red-600 mt-1">
                {formErrors.firstName}
              </p>
            )}
          </div>
          <div className="w-full">
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                formErrors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.lastName && (
              <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Date of Birth"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              formErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.dateOfBirth && (
            <p className="text-xs text-red-600 mt-1">
              {formErrors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              formErrors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.email && (
            <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPassword.password ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              formErrors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <PasswordIcon
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  password: !showPassword.password,
                })
              }
              showPassword={showPassword.password}
            />
          </div>
        </div>
        {formErrors.password && (
          <p className="text-xs text-red-600 -mt-2">{formErrors.password}</p>
        )}

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword.confirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
              formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <PasswordIcon
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  confirmPassword: !showPassword.confirmPassword,
                })
              }
              showPassword={showPassword.confirmPassword}
            />
          </div>
        </div>
        {formErrors.confirmPassword && (
          <p className="text-xs text-red-600 -mt-2">
            {formErrors.confirmPassword}
          </p>
        )}

        {formErrors.form && (
          <p className="text-sm text-red-600">{formErrors.form}</p>
        )}
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
