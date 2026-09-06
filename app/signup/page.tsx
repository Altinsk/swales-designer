"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid } from "date-fns";
import "../../styles/pages/auth.css";
import GoogleLogin from "@/components/auth/GoogleLogin";
import {
  getApiErrorMessage,
  getApiFieldErrors,
  Spinner,
} from "@/components/auth/authFeedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

/**
 * Validates password based on the following rules:
 * - At least 8 characters (spaces allowed anywhere)
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (any non-letter, non-digit, non-space
 *   character — not a narrow allowlist. Previously restricted to only
 *   @$!%*#?&^, which silently rejected an otherwise-valid password
 *   containing e.g. a period.)
 */
const validatePassword = (password = "") => {
  if (typeof password !== "string") return false;
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;
  return re.test(password);
};

// Shown both as the live validation error and as a permanent hint under the
// password field, so the rule is visible before a user hits it as an error.
const PASSWORD_HINT =
  "8+ characters, uppercase, lowercase, a number, and a symbol";

const validateEmail = (email = "") => {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const CalendarIcon = () => (
  <svg
    className="svg-icon"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 10.3281H3M16 2.32812V6.32812M8 2.32812V6.32812M7.8 22.3281H16.2C17.8802 22.3281 18.7202 22.3281 19.362 22.0011C19.9265 21.7135 20.3854 21.2546 20.673 20.6901C21 20.0484 21 19.2083 21 17.5281V9.12813C21 7.44797 21 6.60789 20.673 5.96615C20.3854 5.40167 19.9265 4.94273 19.362 4.65511C18.7202 4.32812 17.8802 4.32812 16.2 4.32812H7.8C6.11984 4.32812 5.27976 4.32812 4.63803 4.65511C4.07354 4.94273 3.6146 5.40167 3.32698 5.96615C3 6.60789 3 7.44797 3 9.12812V17.5281C3 19.2083 3 20.0484 3.32698 20.6901C3.6146 21.2546 4.07354 21.7135 4.63803 22.0011C5.27976 22.3281 6.11984 22.3281 7.8 22.3281Z"
      stroke="#232323"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PasswordIcon = ({
  onClick,
  showPassword,
}: {
  onClick: () => void;
  showPassword?: boolean;
}) => (
  <svg
    onClick={onClick}
    className="eye-off svg-icon cursor-pointer"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {showPassword ? (
      <>
        <path
          d="M12 5.32812C17.1054 5.32812 20.4553 9.83297 21.5807 11.6149C21.7169 11.8306 21.785 11.9385 21.8231 12.1048C21.8518 12.2297 21.8517 12.4268 21.8231 12.5517C21.7849 12.718 21.7164 12.8266 21.5792 13.0437C20.4553 14.8233 17.1054 19.3281 12 19.3281C6.89541 19.3281 3.54554 14.8233 2.42013 13.0413C2.28393 12.8256 2.21583 12.7178 2.17771 12.5515C2.14909 12.4266 2.1491 12.2295 2.17774 12.1046C2.21587 11.9383 2.28428 11.83 2.42111 11.6134C3.54554 9.83297 6.89541 5.32812 12 5.32812Z"
          stroke="#9A9A9A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12.3281"
          r="3"
          stroke="#9A9A9A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <path
        d="M10.7429 5.42044C11.1494 5.36036 11.5686 5.32812 12.0004 5.32812C17.1054 5.32812 20.4553 9.83297 21.5807 11.6149C21.7169 11.8306 21.785 11.9385 21.8231 12.1048C21.8518 12.2297 21.8517 12.4268 21.8231 12.5517C21.7849 12.718 21.7164 12.8266 21.5792 13.0437C21.2793 13.5183 20.8222 14.1852 20.2165 14.9086M6.72432 7.04316C4.56225 8.50983 3.09445 10.5475 2.42111 11.6134C2.28428 11.83 2.21587 11.9383 2.17774 12.1046C2.1491 12.2295 2.14909 12.4266 2.17771 12.5515C2.21583 12.7178 2.28393 12.8256 2.42013 13.0413C3.54554 14.8233 6.89541 19.3281 12.0004 19.3281C14.0588 19.3281 15.8319 18.5957 17.2888 17.6047M3.00042 3.32812L21.0004 21.3281M9.8791 10.2068C9.3362 10.7497 9.00042 11.4997 9.00042 12.3281C9.00042 13.985 10.3436 15.3281 12.0004 15.3281C12.8288 15.3281 13.5788 14.9923 14.1217 14.4494"
        stroke="#9A9A9A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

type FieldName =
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "email"
  | "password"
  | "confirmPassword";

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

  const [isFocused, setIsFocused] = useState<Record<FieldName, boolean>>({
    firstName: false,
    lastName: false,
    dateOfBirth: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Floating labels must stay floated when a browser autofills the inputs,
  // since autofill doesn't fire the focus/change events we track in state.
  useEffect(() => {
    const fieldNames: FieldName[] = [
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
    ];
    const inputs = document.querySelectorAll<HTMLInputElement>("input[name]");

    const handleAutoFillAnimation = (event: AnimationEvent) => {
      if (event.animationName !== "onAutoFillStart") return;
      const target = event.target as HTMLInputElement;
      const name = target.name as FieldName;
      if (!fieldNames.includes(name)) return;
      setFormData((prev) => ({ ...prev, [name]: target.value }));
    };

    inputs.forEach((input) => {
      input.addEventListener("animationstart", handleAutoFillAnimation);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("animationstart", handleAutoFillAnimation);
      });
    };
  }, []);

  const isFloated = (field: FieldName) =>
    isFocused[field] || Boolean(formData[field]);

  const borderClass = (field: FieldName) =>
    formErrors[field]
      ? "danger-control"
      : formData[field]
      ? "success-control"
      : "";

  const labelClass = (field: FieldName) =>
    formErrors[field] ? "danger-label" : formData[field] ? "success-label" : "";

  const handleFocus = (field: FieldName) =>
    setIsFocused((prev) => ({ ...prev, [field]: true }));

  const handleBlur = (field: FieldName) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));

    const value = formData[field];
    const isEmpty = field === "dateOfBirth" ? !value : !String(value).trim();
    if (isEmpty) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "This field can't be empty.",
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as FieldName;
    setFormData((prev) => ({ ...prev, [field]: value }));

    let fieldError = "";
    if (!value.trim()) {
      fieldError = "This field can't be empty.";
    } else if (field === "email" && !validateEmail(value)) {
      fieldError = "Please provide a valid email.";
    } else if (field === "password" && !validatePassword(value)) {
      fieldError = PASSWORD_HINT;
    } else if (field === "confirmPassword" && value !== formData.password) {
      fieldError = "Passwords do not match.";
    }

    setFormErrors((prev) => ({ ...prev, [field]: fieldError, form: "" }));
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
    if (!formData.firstName) errors.firstName = "This field can't be empty.";
    if (!formData.lastName) errors.lastName = "This field can't be empty.";
    if (!formData.email) {
      errors.email = "This field can't be empty.";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please provide a valid email.";
    }
    if (!formData.dateOfBirth)
      errors.dateOfBirth = "This field can't be empty.";

    if (!formData.password) {
      errors.password = "This field can't be empty.";
    } else if (!validatePassword(formData.password)) {
      errors.password = PASSWORD_HINT;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "This field can't be empty.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

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
    <main className="auth-wrapper flex">
      <div className="auth-left flex flex-col">
        <figure className="logo">
          <Link href="https://www.swales.app">
            <Image
              src="/logo.png"
              alt="Swales"
              width={200}
              height={60}
              style={{ width: "200px", height: "auto", marginLeft: "18px" }}
              priority
            />
          </Link>
        </figure>

        <div className="items-center auth-form flex flex-grow m-auto flex-wrap">
          <div className="w-full">
            {successMessage ? (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[#262626]">
                  You&apos;re all set
                </h2>
                <p className="text-green-600">{successMessage}</p>
                <button
                  onClick={() => router.push("/")}
                  className="btn btn-signup-theme btn-login"
                >
                  Go to homepage to log in
                </button>
              </div>
            ) : (
              <>
                <h4>Sign up to start designing your garden</h4>

                <form onSubmit={handleSubmit}>
                  <div className="auth-form-inner floating-form-label flex flex-col">
                    <div
                      className={`form-group ${
                        isFloated("firstName") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label className={labelClass("firstName")}>
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={isLoading}
                          onFocus={() => handleFocus("firstName")}
                          onBlur={() => handleBlur("firstName")}
                          className={`form-control ${borderClass(
                            "firstName"
                          )}`}
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="validation">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        isFloated("lastName") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label className={labelClass("lastName")}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={isLoading}
                          onFocus={() => handleFocus("lastName")}
                          onBlur={() => handleBlur("lastName")}
                          className={`form-control ${borderClass(
                            "lastName"
                          )}`}
                        />
                      </div>
                      {formErrors.lastName && (
                        <p className="validation">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        isFloated("dateOfBirth") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label
                          className={labelClass("dateOfBirth")}
                          style={{ zIndex: 1000 }}
                        >
                          Date of Birth
                        </label>
                        <div className="input-group date-picker-modern">
                          <span className="input-group-icon">
                            <CalendarIcon />
                          </span>
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
                            onFocus={() => handleFocus("dateOfBirth")}
                            onBlur={() => handleBlur("dateOfBirth")}
                            className={`form-control modern-date-input ${borderClass(
                              "dateOfBirth"
                            )}`}
                            wrapperClassName="w-full"
                          />
                        </div>
                        {formErrors.dateOfBirth && (
                          <p className="validation">
                            {formErrors.dateOfBirth}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`form-group ${
                        isFloated("email") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label className={labelClass("email")}>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                          onFocus={() => handleFocus("email")}
                          onBlur={() => handleBlur("email")}
                          className={`form-control ${borderClass("email")}`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="validation">{formErrors.email}</p>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        isFloated("password") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label className={labelClass("password")}>
                          Password
                        </label>
                        <div className="input-icon icon-back">
                          <PasswordIcon
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                password: !showPassword.password,
                              })
                            }
                            showPassword={showPassword.password}
                          />
                          <input
                            type={showPassword.password ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            onFocus={() => handleFocus("password")}
                            onBlur={() => handleBlur("password")}
                            className={`form-control ${borderClass(
                              "password"
                            )}`}
                          />
                        </div>
                      </div>
                      {formErrors.password ? (
                        <p className="validation">{formErrors.password}</p>
                      ) : (
                        <p className="field-hint">{PASSWORD_HINT}</p>
                      )}
                    </div>

                    <div
                      className={`form-group ${
                        isFloated("confirmPassword") ? "label-floated" : ""
                      }`}
                    >
                      <div className="form-relative">
                        <label className={labelClass("confirmPassword")}>
                          Confirm Password
                        </label>
                        <div className="input-icon icon-back">
                          <PasswordIcon
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                confirmPassword: !showPassword.confirmPassword,
                              })
                            }
                            showPassword={showPassword.confirmPassword}
                          />
                          <input
                            type={
                              showPassword.confirmPassword
                                ? "text"
                                : "password"
                            }
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            onFocus={() => handleFocus("confirmPassword")}
                            onBlur={() => handleBlur("confirmPassword")}
                            className={`form-control ${borderClass(
                              "confirmPassword"
                            )}`}
                          />
                        </div>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="validation">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {formErrors.form && (
                      <p role="alert" className="validation">
                        {formErrors.form}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-signup-theme btn-login"
                    >
                      {isLoading && <Spinner />}
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </div>
                </form>

                <div className="or-separator">
                  <span>or</span>
                </div>

                <div className="social-button">
                  <GoogleLogin onClose={() => router.push("/")} />
                </div>

                <div className="already-account">
                  Already have an account?{" "}
                  <Link href="/login">Login</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="auth-right auth-image"></div>
    </main>
  );
}
