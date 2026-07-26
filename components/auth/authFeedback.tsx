"use client";
import React from "react";

/**
 * Pulls a readable message out of an axios error, covering the shapes the API
 * can return: { message }, { error }, or { errors: [{ field, message }] }.
 */
export const getApiErrorMessage = (err: any, fallback: string) => {
  const data = err?.response?.data;

  if (data) {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((e: any) => e?.message || e?.msg || String(e))
        .join(" ");
    }
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
    if (typeof data === "string" && data) return data;
  }

  // No response at all -> network / server unreachable
  if (err?.request && !err?.response) {
    return "Cannot reach the server. Please check your connection and try again.";
  }

  return err?.message || fallback;
};

/** Maps API field errors (if any) onto the local form error object. */
export const getApiFieldErrors = (err: any): Record<string, string> => {
  const errors = err?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc: Record<string, string>, e: any) => {
    const field = e?.field || e?.path || e?.param;
    const message = e?.message || e?.msg;
    if (field && message) acc[field] = message;
    return acc;
  }, {});
};

export const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
