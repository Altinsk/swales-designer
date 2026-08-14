"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../../styles/pages/auth.css";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import GoogleLogin from "@/components/auth/GoogleLogin";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import { getApiErrorMessage, Spinner } from "@/components/auth/authFeedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        router.push("/");
        return;
      }
      setError(res.data.message || "Invalid email or password.");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "An error occurred during login."));
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
            <h4>Please login to continue to your account.</h4>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-inner floating-form-label flex flex-col">
                <div className="form-group">
                  <div className="form-relative">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-relative">
                    <label>Password</label>
                    <div className="input-icon icon-back">
                      <PasswordIcon
                        onClick={() => setShowPassword(!showPassword)}
                        showPassword={showPassword}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-between">
                  <div className="flex login-remember items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember">Keep me logged in</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    style={{ color: "var(--color-theme)" }}
                  >
                    Forgot password
                  </button>
                </div>

                {error && (
                  <p role="alert" className="validation">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-signup-theme btn-login"
                >
                  {isLoading && <Spinner />}
                  {isLoading ? "Signing In..." : "Sign in"}
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
              Need an account? <Link href="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right auth-image"></div>

      {showForgotPassword && (
        <Modal
          isOpen={true}
          onClose={() => setShowForgotPassword(false)}
          title="Login to Your Account"
        >
          <ForgotPasswordModal
            onClose={() => setShowForgotPassword(false)}
            onSwitchToLogin={() => setShowForgotPassword(false)}
          />
        </Modal>
      )}
    </main>
  );
}
