"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import { sectionService, lessonService } from "@/services/section.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  isFreePreview: boolean;
  orderIndex: number;
  videoUrl: string | null;
  durationSeconds: number | null;
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
  sections: Section[];
}

export default function CourseContentPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Section form state
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Lesson form state — tracks which section is open for adding
  const [addingLessonToSection, setAddingLessonToSection] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonFreePreview, setNewLessonFreePreview] = useState(false);

  // Edit state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "TEACHER") {
      router.push("/login");
      return;
    }
    const fetchCourse = async () => {
      try {
        const result = await courseService.getById(id);
        // getById doesn't include sections — use getBySlug won't work either
        // so we fetch full course with sections via a dedicated call
        const full = await courseService.getWithSections(id);
        setCourse(full.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [isAuthenticated, router, user?.role, id]);

  // ── Section actions ──────────────────────────────────────────

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      setAddingSection(true);
      const result = await sectionService.create(id, {
        title: newSectionTitle,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: [...prev.sections, result.data],
            }
          : prev,
      );
      setNewSectionTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSection(false);
    }
  };

  const handleUpdateSection = async (sectionId: string) => {
    if (!editingSectionTitle.trim()) return;
    try {
      const result = await sectionService.update(sectionId, {
        title: editingSectionTitle,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId ? { ...s, title: result.data.title } : s,
              ),
            }
          : prev,
      );
      setEditingSectionId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    try {
      await sectionService.delete(sectionId);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.filter((s) => s.id !== sectionId),
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ── Lesson actions ───────────────────────────────────────────

  const handleAddLesson = async (sectionId: string) => {
    if (!newLessonTitle.trim()) return;
    try {
      const result = await lessonService.create(sectionId, {
        title: newLessonTitle,
        isFreePreview: newLessonFreePreview,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, lessons: [...s.lessons, result.data] }
                  : s,
              ),
            }
          : prev,
      );
      setNewLessonTitle("");
      setNewLessonFreePreview(false);
      setAddingLessonToSection(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLesson = async (lessonId: string, sectionId: string) => {
    if (!editingLessonTitle.trim()) return;
    try {
      const result = await lessonService.update(lessonId, {
        title: editingLessonTitle,
        isFreePreview: false,
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      lessons: s.lessons.map((l) =>
                        l.id === lessonId
                          ? { ...l, title: result.data.title }
                          : l,
                      ),
                    }
                  : s,
              ),
            }
          : prev,
      );
      setEditingLessonId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId: string, sectionId: string) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await lessonService.delete(lessonId);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      lessons: s.lessons.filter((l) => l.id !== lessonId),
                    }
                  : s,
              ),
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course content</h1>
          <p className="text-gray-500 mt-1">{course.title}</p>
        </div>
        <Link href="/teacher/dashboard">
          <Button variant="secondary">← Back to dashboard</Button>
        </Link>
      </div>

      {/* Sections */}
      <div className="space-y-4 mb-6">
        {course.sections.length === 0 && (
          <div
            className="text-center py-12 bg-white rounded-xl border
            border-dashed border-gray-200"
          >
            <p className="text-gray-400 text-sm">
              No sections yet — add your first section below
            </p>
          </div>
        )}

        {course.sections.map((section, sIndex) => (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Section header */}
            <div
              className="flex items-center justify-between px-5 py-4
              bg-gray-50 border-b border-gray-100"
            >
              {editingSectionId === section.id ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <Input
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateSection(section.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSectionId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <h3 className="font-semibold text-gray-900">
                  Section {sIndex + 1}: {section.title}
                </h3>
              )}
              {editingSectionId !== section.id && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingSectionId(section.id);
                      setEditingSectionTitle(section.title);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Lessons */}
            <div className="divide-y divide-gray-50">
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  {editingLessonId === lesson.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <Input
                        value={editingLessonTitle}
                        onChange={(e) => setEditingLessonTitle(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateLesson(lesson.id, section.id)
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLessonId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs">▶</span>
                        <span className="text-sm text-gray-800">
                          {lesson.title}
                        </span>
                        {lesson.isFreePreview && (
                          <span
                            className="text-xs bg-primary-100 text-primary-700
                            px-2 py-0.5 rounded-full font-medium"
                          >
                            Free preview
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingLessonId(lesson.id);
                            setEditingLessonTitle(lesson.title);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleDeleteLesson(lesson.id, section.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add lesson form */}
              {addingLessonToSection === section.id ? (
                <div className="px-5 py-3 bg-gray-50 flex items-center gap-3">
                  <Input
                    placeholder="Lesson title"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddLesson(section.id)
                    }
                  />
                  <label
                    className="flex items-center gap-1.5 text-xs
                    text-gray-600 whitespace-nowrap"
                  >
                    <input
                      type="checkbox"
                      checked={newLessonFreePreview}
                      onChange={(e) =>
                        setNewLessonFreePreview(e.target.checked)
                      }
                      className="w-3.5 h-3.5"
                    />
                    Free preview
                  </label>
                  <Button size="sm" onClick={() => handleAddLesson(section.id)}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingLessonToSection(null);
                      setNewLessonTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="px-5 py-3">
                  <button
                    onClick={() => setAddingLessonToSection(section.id)}
                    className="text-sm text-primary-600 hover:text-primary-700
                      font-medium flex items-center gap-1"
                  >
                    + Add lesson
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add section form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-900 mb-3">Add a new section</h3>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Section title e.g. Getting Started"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
            className="flex-1"
          />
          <Button isLoading={addingSection} onClick={handleAddSection}>
            Add section
          </Button>
        </div>
      </div>
    </div>
  );
}
