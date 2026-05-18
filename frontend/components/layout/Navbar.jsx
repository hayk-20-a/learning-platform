"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-primary-600 rounded-lg flex items-center
              justify-center text-white font-bold text-sm"
            >
              L
            </div>
            <span className="font-semibold text-gray-900">LearnHub</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse courses
            </Link>
            {isAuthenticated && user?.role === "TEACHER" && (
              <Link
                href="/teacher/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Log out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
