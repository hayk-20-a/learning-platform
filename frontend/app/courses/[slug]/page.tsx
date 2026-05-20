"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { courseService } from "@/services/course.service";
import { enrollmentService } from "@/services/enrollment.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

interface Lesson {
  id: string;
  title: string;
  durationSeconds: number | null;
  isFreePreview: boolean;
  orderIndex: number;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: string | number;
  isPublished: boolean;
  teacher: { id: string; name: string; avatarUrl: string | null };
  category: { name: string; slug: string };
  sections: Section[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    user: { name: string };
  }[];
  _count: { enrollments: number };
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await courseService.getBySlug(slug);
        setCourse(result.data);

        // Check if already enrolled
        if (isAuthenticated) {
          try {
            const enrollments = await enrollmentService.getMyEnrollments();
            const isEnrolled = enrollments.data.some(
              (e: { course: { slug: string } }) => e.course.slug === slug,
            );
            setEnrolled(isEnrolled);
          } catch {
            // not enrolled, that's fine
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      setEnrolling(true);
      setError("");
      await enrollmentService.enroll(course!.id);
      setEnrolled(true);
    } catch (err: unknown) {
      // 409 means already enrolled — treat it as success
      const axiosError = err as { response?: { status: number } };
      if (axiosError.response?.status === 409) {
        setEnrolled(true);
        return;
      }
      const message = err instanceof Error ? err.message : "Could not enroll";
      setError(message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">
          Course not found
        </h2>
      </div>
    );
  }

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0,
  );
  const avgRating =
    course.reviews.length > 0
      ? (
          course.reviews.reduce((sum, r) => sum + r.rating, 0) /
          course.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-teal-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <span
              className="inline-block px-3 py-1 bg-white/20 rounded-full
              text-xs font-medium mb-4"
            >
              {course.category.name}
            </span>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-white/80 text-lg mb-6">{course.description}</p>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <span>👨‍🏫 {course.teacher.name}</span>
              <span>👥 {course._count.enrollments} students</span>
              <span>📚 {totalLessons} lessons</span>
              {avgRating && <span>⭐ {avgRating}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Curriculum */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Course curriculum
              </h2>
              {course.sections.length === 0 ? (
                <p className="text-gray-500 text-sm">No content added yet.</p>
              ) : (
                <div className="space-y-3">
                  {course.sections.map((section) => (
                    <div key={section.id}>
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between
                              py-2 px-3 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs">
                                {lesson.isFreePreview ? "▶️" : "🔒"}
                              </span>
                              <span className="text-sm text-gray-700">
                                {lesson.title}
                              </span>
                              {lesson.isFreePreview && (
                                <span className="text-xs text-primary-600 font-medium">
                                  Free preview
                                </span>
                              )}
                            </div>
                            {lesson.durationSeconds && (
                              <span className="text-xs text-gray-400">
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {course.reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Student reviews
                </h2>
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-50 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {review.user.name}
                        </span>
                        <span className="text-yellow-400 text-xs">
                          {"★".repeat(review.rating)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-gradient-to-br
                from-primary-100 to-primary-200 rounded-lg mb-4 overflow-hidden
                flex items-center justify-center"
              >
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-300">
                    {course.title.charAt(0)}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {Number(course.price) === 0
                  ? "Free"
                  : `$${Number(course.price).toFixed(2)}`}
              </div>

              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

              {enrolled ? (
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to my courses →
                </Button>
              ) : (
                <Button
                  className="w-full"
                  isLoading={enrolling}
                  onClick={handleEnroll}
                >
                  {Number(course.price) === 0
                    ? "Enroll for free"
                    : `Enroll for $${Number(course.price).toFixed(2)}`}
                </Button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  You need an account to enroll
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-3">
                  This course includes:
                </p>
                {[
                  `${totalLessons} lessons`,
                  `${course.sections.length} sections`,
                  "Full lifetime access",
                  "Certificate of completion",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="text-primary-500">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
