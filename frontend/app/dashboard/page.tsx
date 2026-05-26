"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { enrollmentService } from "@/services/enrollment.service";
import { useAuthStore } from "@/store/authStore";

interface Enrollment {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    teacher: { name: string };
    category: { name: string };
    _count: { lessons: number };
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const fetchEnrollments = async () => {
      try {
        const result = await enrollmentService.getMyEnrollments();
        setEnrollments(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {user && !user.isEmailVerified && (
        <div className="bg-accent-100 border-b border-accent-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-accent-700 text-sm font-medium">
              📬 Please verify your email address to unlock all features.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1">Continue where you left off</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No courses yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Browse courses and start learning today
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center px-4 py-2 bg-primary-600
              text-white text-sm font-medium rounded-lg hover:bg-primary-700
              transition-colors"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/learn/${enrollment.course.id}`}>
                <div
                  className="bg-white rounded-xl border border-gray-100
                overflow-hidden hover:shadow-md hover:border-gray-200
                transition-all duration-200 cursor-pointer group"
                >
                  <div
                    className="relative aspect-video bg-gradient-to-br from-primary-100
                  to-primary-200 flex items-center justify-center"
                  >
                    {enrollment.course.thumbnailUrl ? (
                      <Image
                        src={enrollment.course.thumbnailUrl!}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-300">
                        {enrollment.course.title.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-accent-600 font-medium">
                      {enrollment.course.category.name}
                    </span>

                    <h3
                      className="font-semibold text-gray-900 text-sm mt-1
                    group-hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {enrollment.course.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {enrollment.course.teacher.name}
                    </p>

                    <div
                      className="mt-3 pt-3 border-t border-gray-50
                    flex items-center justify-between"
                    >
                      <span className="text-xs text-gray-500">
                        {enrollment.course._count.lessons} sections
                      </span>

                      <span className="text-xs font-medium text-primary-600">
                        Continue learning →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
