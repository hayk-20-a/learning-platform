"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { courseService } from "@/services/course.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

interface Course {
  id: string;
  title: string;
  price: string | number;
  isPublished: boolean;
  category: { name: string };
  _count: { enrollments: number };
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }
    const fetchCourses = async () => {
      try {
        const result = await courseService.getMyCourses();
        setCourses(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [isAuthenticated, router, user?.role]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await courseService.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await courseService.update(course.id, {
        isPublished: !course.isPublished,
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: !c.isPublished } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1">Manage your courses</p>
        </div>
        <Link href="/teacher/courses/new">
          <Button>+ New course</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total courses", value: courses.length },
          {
            label: "Published",
            value: courses.filter((c) => c.isPublished).length,
          },
          {
            label: "Total students",
            value: courses.reduce((sum, c) => sum + c._count.enrollments, 0),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No courses yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Create your first course and start teaching
          </p>
          <Link href="/teacher/courses/new">
            <Button>Create your first course</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Course
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Students
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Price
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {course.title}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {course.category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        course.isPublished
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {course._count.enrollments}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {Number(course.price) === 0
                      ? "Free"
                      : `$${Number(course.price).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(course)}
                        className={
                          course.isPublished
                            ? "text-amber-600 hover:text-amber-700"
                            : "text-primary-600 hover:text-primary-700"
                        }
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Link href={`/teacher/courses/${course.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/teacher/courses/${course.id}/content`}>
                        <Button variant="ghost" size="sm">
                          Content
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
