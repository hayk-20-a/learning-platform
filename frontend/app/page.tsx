import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div
              className="inline-block bg-primary-100 text-primary-700
              text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-wide
              uppercase"
            >
              Stop struggling. Start understanding.
            </div>
            <h1
              className="text-5xl font-extrabold text-primary-900
              leading-tight mb-6 tracking-tight"
            >
              Hard subjects made{" "}
              <span className="text-primary-600">simple.</span>
            </h1>
            <p
              className="text-xl text-primary-800/70 mb-8 leading-relaxed
              max-w-2xl"
            >
              Finally understand math, physics, and programming with expert-led
              courses built for students who want to really get it — not just
              pass.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/courses">
                <button
                  className="bg-primary-600 text-white text-base
                  font-bold px-6 py-3 rounded-xl hover:bg-primary-700
                  transition-colors"
                >
                  Browse courses
                </button>
              </Link>
              <Link href="/register">
                <button
                  className="bg-white text-primary-700 text-base
                  font-semibold px-6 py-3 rounded-xl border-2
                  border-primary-200 hover:border-primary-400
                  transition-colors"
                >
                  Start teaching
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "10,000+", label: "Students helped" },
              { value: "500+", label: "Expert courses" },
              { value: "100+", label: "Top instructors" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-accent-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learnly */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-extrabold text-primary-900 mb-3
              tracking-tight"
            >
              Why students choose Learnly
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We built this for students who tried everything else and still did
              not get it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "Built for understanding",
                desc: "Not just memorization. Our courses explain the why behind everything so it actually sticks.",
              },
              {
                icon: "⚡",
                title: "Learn at your pace",
                desc: "Rewatch, pause, rewind. No pressure. Study when you want, as slowly as you need.",
              },
              {
                icon: "🏆",
                title: "Real results",
                desc: "Students who use Learnly see their grades improve within weeks. Not months.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100
                  hover:border-primary-200 hover:bg-primary-50
                  transition-all duration-200 group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-primary-900 mb-2 text-lg">
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

      {/* Subjects */}
      <section className="bg-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-extrabold text-primary-900 mb-8
            tracking-tight text-center"
          >
            What you can learn
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: "∑",
                label: "Mathematics",
                color: "bg-blue-50 text-blue-700",
              },
              {
                icon: "⚛",
                label: "Physics",
                color: "bg-purple-50 text-purple-700",
              },
              {
                icon: "</>",
                label: "Programming",
                color: "bg-primary-50 text-primary-700",
              },
              {
                icon: "🧪",
                label: "Chemistry",
                color: "bg-orange-50 text-orange-700",
              },
            ].map((subject) => (
              <Link href="/courses" key={subject.label}>
                <div
                  className="bg-white rounded-2xl border border-gray-100
                  p-6 text-center hover:border-primary-200 hover:shadow-sm
                  transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 ${subject.color} rounded-xl
                    flex items-center justify-center text-xl font-bold
                    mx-auto mb-3`}
                  >
                    {subject.icon}
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {subject.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary-800 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl font-extrabold text-white mb-4
            tracking-tight"
          >
            Ready to finally understand?
          </h2>
          <p className="text-primary-200 mb-8 text-lg">
            Join thousands of students who stopped struggling and started
            achieving.
          </p>
          <Link href="/register">
            <button
              className="bg-accent-300 text-primary-900 font-bold
              text-base px-8 py-4 rounded-xl hover:bg-accent-200
              transition-colors"
            >
              Create free account →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
