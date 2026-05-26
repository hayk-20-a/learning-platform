import Link from "next/link";

export default function VerifySuccess() {
  return (
    <div
      className="min-h-screen bg-primary-50 flex items-center
      justify-center px-4"
    >
      <div
        className="bg-white rounded-2xl border border-primary-100
        p-10 max-w-md w-full text-center shadow-sm"
      >
        <div
          className="w-16 h-16 bg-primary-100 rounded-full flex
          items-center justify-center mx-auto mb-6"
        >
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-extrabold text-primary-900 mb-3">
          Email verified!
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your Learnly account is now active. Start learning today.
        </p>
        <Link href="/login">
          <button
            className="w-full bg-primary-600 text-white font-bold
            py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Log in to your account
          </button>
        </Link>
      </div>
    </div>
  );
}
