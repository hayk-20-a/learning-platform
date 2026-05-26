import Link from "next/link";

export default function VerifyError() {
  return (
    <div
      className="min-h-screen bg-primary-50 flex items-center
      justify-center px-4"
    >
      <div
        className="bg-white rounded-2xl border border-red-100
        p-10 max-w-md w-full text-center shadow-sm"
      >
        <div
          className="w-16 h-16 bg-red-50 rounded-full flex
          items-center justify-center mx-auto mb-6"
        >
          <span className="text-3xl">❌</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
          Link expired
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          This verification link has expired or already been used. Register
          again to get a new link.
        </p>
        <Link href="/register">
          <button
            className="w-full bg-primary-600 text-white font-bold
            py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Back to register
          </button>
        </Link>
      </div>
    </div>
  );
}
