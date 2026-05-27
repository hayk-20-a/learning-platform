"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/utils/apiError";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authService.resetPassword({ token, password });
      router.push("/login?reset=success");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "This reset link has expired. Please request a new one.",
        ),
      );
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
            Set new password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-100
            rounded-lg"
          >
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border
                border-gray-200 focus:outline-none focus:ring-2
                focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
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
              transition-colors mt-2"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
