import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <section className="bg-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Learn without limits
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Start, switch, or advance your career with thousands of courses
              from expert instructors.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-accent-200 text-gray-900 hover:bg-accent-300 border-0"
                >
                  Browse courses
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white/20 text-white border border-white/40
                    hover:bg-white/30"
                >
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

      {/* Features section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why LearnHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Expert instructors",
                desc: "Learn from professionals with real-world experience",
              },
              {
                icon: "⚡",
                title: "Learn at your pace",
                desc: "Access content anytime, anywhere, on any device",
              },
              {
                icon: "🏆",
                title: "Earn certificates",
                desc: "Prove your skills with industry-recognized certificates",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl border border-gray-100
                  hover:border-primary-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
