"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/apiError";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const result = await authService.register(data);
      login(result.data.user, result.data.token);
      router.push(
        result.data.user.role === "TEACHER"
          ? "/teacher/dashboard"
          : "/dashboard",
      );
    } catch (err) {
      const fieldErrors = applyApiFieldErrors(err, setError);
      setServerError(
        Object.keys(fieldErrors).length ? "" : getApiErrorMessage(err),
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm mt-1">Start learning today</p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Full name"
              placeholder="John Smith"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                I want to
              </label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                  bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register("role")}
                defaultValue="student"
              >
                <option value="student">Learn - I&apos;m a student</option>
                <option value="teacher">Teach - I&apos;m an instructor</option>
              </select>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingLabel="Creating..."
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
