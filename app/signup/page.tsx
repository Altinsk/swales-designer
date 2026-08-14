"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid } from "date-fns";
import GoogleLogin from "@/components/auth/GoogleLogin";
import {
  getApiErrorMessage,
  getApiFieldErrors,
  Spinner,
} from "@/components/auth/authFeedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

/**
 * Validates password based on the following rules:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (@$!%*#?&^)
 */
const validatePassword = (password = "") => {
  if (typeof password !== "string") return false;
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{8,}$/;
  return re.test(password);
};

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

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: null as Date | null,
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
    form: "",
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name as keyof typeof formErrors] || formErrors.form) {
      setFormErrors({ ...formErrors, [name]: "", form: "" });
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

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (!validatePassword(formData.password)) {
      errors.password =
        "Password must be 8+ characters and include uppercase, lowercase, a number, and a special character (@$!%*#?&^).";
    }

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setFormErrors({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      form: "",
    });

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth?.toISOString().split("T")[0],
        src: "designer",
      };

      const res = await axios.post(`${API_URL}/auth/register`, payload, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSuccessMessage(
          (res.data.message || "Account created") + ". You can now log in."
        );
        return;
      }
      setFormErrors((prev) => ({
        ...prev,
        form: res.data.message || "An error occurred during sign up.",
      }));
    } catch (err: any) {
      setFormErrors((prev) => ({
        ...prev,
        ...getApiFieldErrors(err),
        form: getApiErrorMessage(err, "An error occurred during sign up."),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white p-3">
      {/* Left: form */}
      <div className="w-full lg:w-[591px] lg:max-w-[591px] flex flex-col p-4 sm:p-8">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Swales"
            width={160}
            height={48}
            style={{ width: "160px", height: "auto" }}
            priority
          />
        </Link>

        <div className="flex-grow flex items-center">
          <div className="w-full max-w-[400px] mx-auto py-8">
            {successMessage ? (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">
                  You&apos;re all set
                </h2>
                <p className="text-green-600">{successMessage}</p>
                <button
                  onClick={() => router.push("/")}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Go to homepage to log in
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-gray-500 text-lg font-bold mb-6">
                  Sign up to start designing your garden
                </h4>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                          formErrors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-xs text-red-600 mt-1">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                          formErrors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-xs text-red-600 mt-1">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <DatePicker
                      selected={formData.dateOfBirth}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      showYearDropdown
                      showMonthDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      placeholderText="DD/MM/YYYY"
                      disabled={isLoading}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                        formErrors.dateOfBirth
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      wrapperClassName="w-full"
                    />
                    {formErrors.dateOfBirth && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword.password ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                          formErrors.password
                            ? "border-red-500"
                            : "border-gray-300"
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
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                          formErrors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
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
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {formErrors.form && (
                    <p
                      role="alert"
                      className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                    >
                      {formErrors.form}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading && <Spinner />}
                    {isLoading ? "Signing Up..." : "Sign Up"}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <GoogleLogin onClose={() => router.push("/")} />

                <p className="text-center font-bold text-gray-500 mt-8">
                  Already have an account?{" "}
                  <Link href="/" className="text-green-600 hover:text-green-500">
                    Login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: decorative panel */}
      <div className="hidden lg:block flex-1 relative">
        <div
          className="absolute inset-0 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: "url('/template1.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 rounded-3xl" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-2xl font-bold drop-shadow">
              Design your garden with Swales
            </p>
            <p className="text-white/80 mt-1 drop-shadow">
              Plan, plot and print your permaculture layout in minutes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
