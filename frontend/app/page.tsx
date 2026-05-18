import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Learn without limits
            </h1>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              Start, switch, or advance your career with thousands of courses
              from expert instructors.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/courses">
                <Button size="lg">Browse courses</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Become a teacher
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "10,000+", label: "Students" },
              { value: "500+", label: "Courses" },
              { value: "100+", label: "Expert teachers" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-accent-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
