"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react"; // Import icons

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Password validation utility function. "Special character" means any
// non-letter, non-digit, non-space character - not a narrow allowlist.
// Previously restricted to only @$!%*#?&^, which silently rejected an
// otherwise-valid password containing e.g. a period. Spaces are allowed
// anywhere in the password (they just don't count toward the symbol
// requirement).
export const validatePassword = (password = "") => {
  if (typeof password !== "string") return false; // Ensure input is a string
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;
  return re.test(password);
};

// Shown both as the live validation error and as a permanent hint under the
// password field, so the rule is visible before a user hits it as an error.
export const PASSWORD_HINT =
  "8+ characters, uppercase, lowercase, a number, and a symbol";

type FieldName = "password" | "confirmPassword";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
    form: "",
  });
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
      setFormErrors((prev) => ({
        ...prev,
        form: "Invalid or missing reset token. Please try again.",
      }));
    }
  }, [searchParams]);

  const borderClass = (field: FieldName) =>
    formErrors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : formData[field]
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "border-gray-300 focus:border-green-500 focus:ring-green-500";

  const handleBlur = (field: FieldName) => {
    if (!formData[field].trim()) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "This field can't be empty.",
      }));
    }
  };

  const handleChange = (
    field: FieldName,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    let fieldError = "";
    if (!value.trim()) {
      fieldError = "This field can't be empty.";
    } else if (field === "password" && !validatePassword(value)) {
      fieldError = PASSWORD_HINT;
    } else if (
      field === "confirmPassword" &&
      value !== formData.password
    ) {
      fieldError = "Your confirm password does not match the password.";
    }

    setFormErrors((prev) => ({ ...prev, [field]: fieldError, form: "" }));
  };

  const validateForm = () => {
    const errors = { password: "", confirmPassword: "" };
    let valid = true;

    if (!formData.password) {
      errors.password = "Please provide your password.";
      valid = false;
    } else if (!validatePassword(formData.password)) {
      errors.password = PASSWORD_HINT;
      valid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please provide your confirm password.";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "The passwords do not match. Please try again.";
      valid = false;
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors((prev) => ({ ...prev, form: "" }));

    if (!validateForm()) return;

    if (!token) {
      setFormErrors((prev) => ({
        ...prev,
        form: "No reset token found. Please request a new link.",
      }));
      return;
    }

    setSuccessMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/auth/reset-password`,
        { token, newPassword: formData.password },
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
      setFormErrors((prev) => ({
        ...prev,
        form:
          err.response?.data?.message ||
          "An error occurred. The token may be invalid or expired.",
      }));
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
        <h2 className="text-2xl font-semibold text-center text-[#262626] mb-6">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#404040]">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                disabled={isLoading || !!successMessage}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none pr-10 ${borderClass(
                  "password"
                )}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password ? (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.password}
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">{PASSWORD_HINT}</p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#404040]">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                disabled={isLoading || !!successMessage}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none pr-10 ${borderClass(
                  "confirmPassword"
                )}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          {formErrors.form && (
            <p className="text-sm text-red-600">{formErrors.form}</p>
          )}
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
