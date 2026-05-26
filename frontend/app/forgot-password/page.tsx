"use client";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setSent(true); // Show success anyway for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-primary-50 flex items-center
      justify-center px-4"
    >
      <div
        className="bg-white rounded-2xl border border-primary-100
        p-8 max-w-md w-full shadow-sm"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-primary-900">
            Forgot your password?
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and we will send a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="font-bold text-primary-900 mb-2">
              Check your inbox
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              If that email exists in our system, a reset link is on its way.
            </p>
            <Link
              href="/login"
              className="text-primary-600 font-semibold text-sm
                hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border
                  border-gray-200 focus:outline-none focus:ring-2
                  focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-bold
                py-3 rounded-xl hover:bg-primary-700 disabled:opacity-50
                transition-colors"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <Link
              href="/login"
              className="text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
