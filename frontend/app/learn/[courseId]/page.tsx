"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { enrollmentService } from "@/services/enrollment.service";
import { progressService } from "@/services/progress.service";
import { useAuthStore } from "@/store/authStore";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
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
  teacher: { name: string };
  sections: Section[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Player = ReactPlayer as any;

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const fetchCourse = async () => {
      try {
        const result = await enrollmentService.getLearnCourse(courseId);
        setCourse(result.data.course);
        setCompletedIds(result.data.completedLessonIds);
        const allLessons = result.data.course.sections.flatMap(
          (s: Section) => s.lessons,
        );
        const firstLesson =
          allLessons.find((l: Lesson) => l.videoUrl) || allLessons[0];
        if (firstLesson) setCurrentLesson(firstLesson);
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [isAuthenticated, courseId, router]);

  const handleMarkComplete = async () => {
    if (!currentLesson || completedIds.includes(currentLesson.id)) return;
    try {
      setMarking(true);
      await progressService.markComplete(currentLesson.id);
      setCompletedIds((prev) => [...prev, currentLesson.id]);
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  const handleNextLesson = useCallback(() => {
    if (!course || !currentLesson) return;
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  }, [course, currentLesson]);

  const handlePrevLesson = useCallback(() => {
    if (!course || !currentLesson) return;
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  }, [course, currentLesson]);

  const handleVideoEnded = useCallback(async () => {
    if (!currentLesson) return;
    if (!completedIds.includes(currentLesson.id)) {
      await progressService.markComplete(currentLesson.id);
      setCompletedIds((prev) => [...prev, currentLesson.id]);
    }
    setTimeout(handleNextLesson, 1500);
  }, [currentLesson, completedIds, handleNextLesson]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div
            className="animate-spin w-8 h-8 border-2 border-white/20
            border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-white/60 text-sm">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const completedCount = completedIds.length;
  const totalCount = allLessons.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div
        className="bg-primary-900 border-b border-primary-800 px-4
        h-14 flex items-center justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white/60 hover:text-white text-sm
              transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-white/20" />
          <h1
            className="text-white font-semibold text-sm truncate
            max-w-xs md:max-w-md"
          >
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 bg-white/10 rounded-full h-1.5">
              <div
                className="bg-accent-300 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-white/60">
              {completedCount}/{totalCount}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="text-white/60 hover:text-white text-xs
              border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {sidebarOpen ? "Hide" : "Show"} curriculum
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Video player */}
          <div
            className="bg-black w-full"
            style={{ height: "60vh", position: "relative" }}
          >
            {currentLesson?.videoUrl ? (
              <video
                key={currentLesson.id}
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full"
                onEnded={handleVideoEnded}
                style={{ background: "#000" }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-white/40 text-sm">
                    No video uploaded for this lesson yet
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="p-6 bg-gray-900 border-b border-gray-800">
            <div className="max-w-4xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-white text-xl font-bold mb-1">
                    {currentLesson?.title || "Select a lesson"}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {course.teacher.name} · Lesson {currentIndex + 1} of{" "}
                    {totalCount}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevLesson}
                    disabled={currentIndex <= 0}
                    className="px-4 py-2 text-sm font-medium text-white/60
                      border border-white/20 rounded-lg hover:text-white
                      hover:border-white/40 disabled:opacity-30
                      disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextLesson}
                    disabled={currentIndex >= totalCount - 1}
                    className="px-4 py-2 text-sm font-medium text-white/60
                      border border-white/20 rounded-lg hover:text-white
                      hover:border-white/40 disabled:opacity-30
                      disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                  {currentLesson &&
                    (completedIds.includes(currentLesson.id) ? (
                      <div
                        className="flex items-center gap-2 px-4 py-2
                        bg-primary-600/20 text-primary-400 text-sm
                        font-medium rounded-lg border border-primary-600/30"
                      >
                        ✓ Completed
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="px-4 py-2 bg-primary-600 text-white
                          text-sm font-semibold rounded-lg
                          hover:bg-primary-700 disabled:opacity-50
                          transition-colors"
                      >
                        {marking ? "Saving..." : "Mark complete"}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className="w-80 flex-shrink-0 bg-gray-900 border-l
            border-gray-800 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">
                Course curriculum
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-accent-300 h-1 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-white/40">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {course.sections.map((section, sIndex) => (
              <div key={section.id}>
                <div className="px-4 py-3 bg-gray-800/50">
                  <h4
                    className="text-white/60 text-xs font-semibold
                    uppercase tracking-wide"
                  >
                    Section {sIndex + 1}
                  </h4>
                  <p className="text-white text-sm font-medium mt-0.5">
                    {section.title}
                  </p>
                </div>

                {section.lessons.map((lesson, lIndex) => {
                  const isActive = currentLesson?.id === lesson.id;
                  const isCompleted = completedIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left px-4 py-3 flex items-start
                        gap-3 border-b border-gray-800/50 transition-colors
                        ${
                          isActive
                            ? "bg-primary-600/20 border-l-2 border-l-primary-500"
                            : "hover:bg-gray-800"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex-shrink-0
                        flex items-center justify-center mt-0.5 text-xs
                        ${
                          isCompleted
                            ? "bg-primary-500 text-white"
                            : isActive
                              ? "bg-primary-600/40 text-primary-400 border border-primary-500"
                              : "bg-gray-700 text-gray-500"
                        }`}
                      >
                        {isCompleted ? "✓" : lIndex + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            isActive
                              ? "text-white font-medium"
                              : "text-white/70"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.videoUrl ? (
                            <span className="text-xs text-white/30">
                              ▶ Video
                            </span>
                          ) : (
                            <span className="text-xs text-white/20">
                              No video
                            </span>
                          )}
                          {lesson.isFreePreview && (
                            <span className="text-xs text-accent-400">
                              Free preview
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
