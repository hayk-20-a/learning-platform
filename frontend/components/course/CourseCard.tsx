import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    price: string | number;
    teacher: { name: string };
    category: { name: string };
    _count: { enrollments: number };
  };
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div
        className={cn(
          "bg-white rounded-xl border border-gray-100 overflow-hidden",
          "hover:shadow-md hover:border-gray-200 transition-all duration-200",
          "cursor-pointer group",
          className,
        )}
      >
        {/* Thumbnail */}
        <div
          className="relative aspect-video bg-gradient-to-br
          from-primary-100 to-primary-200 overflow-hidden
          flex items-center justify-center"
        >
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="text-primary-600 text-4xl font-bold opacity-30">
              {course.title.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <span
            className="inline-block px-2 py-0.5 bg-accent-100 text-accent-700
            text-xs font-medium rounded-full mb-2"
          >
            {course.category.name}
          </span>

          <h3
            className="font-semibold text-gray-900 text-sm leading-snug mb-1
            line-clamp-2 group-hover:text-primary-600 transition-colors"
          >
            {course.title}
          </h3>

          <p className="text-xs text-gray-500 mb-3">{course.teacher.name}</p>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">
              {Number(course.price) === 0
                ? "Free"
                : `$${Number(course.price).toFixed(2)}`}
            </span>
            <span className="text-xs text-gray-400">
              {course._count.enrollments} students
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
