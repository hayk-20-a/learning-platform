"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-primary-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-white/15 flex items-center
              justify-center flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 2L3 7v8l8 5 8-5V7L11 2z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              learn<span className="text-accent-300">ly</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className="text-sm text-white/80 hover:text-white
                font-medium transition-colors"
            >
              Browse courses
            </Link>
            {isAuthenticated && user?.role === "TEACHER" && (
              <Link
                href="/teacher/dashboard"
                className="text-sm text-white/80 hover:text-white
                  font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "STUDENT" && (
              <Link
                href="/dashboard"
                className="text-sm text-white/80 hover:text-white
                  font-medium transition-colors"
              >
                My learning
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80 hidden sm:block">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-white/80
                    hover:text-white transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white/80
                    hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link href="/register">
                  <button
                    className="bg-accent-300 text-primary-900
                    text-sm font-bold px-4 py-2 rounded-lg
                    hover:bg-accent-200 transition-colors"
                  >
                    Get started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
