"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/apiError";

interface Category {
  id: string;
  name: string;
}

interface CourseForm {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  isPublished: boolean;
}

export default function EditCoursePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CourseForm>();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "TEACHER") {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          courseService.getById(id),
          categoryService.getAll(),
        ]);
        setCategories(catRes.data);
        const c = courseRes.data;
        reset({
          title: c.title,
          description: c.description,
          categoryId: c.categoryId,
          price: c.price,
          isPublished: c.isPublished,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, router, user?.role, id, reset]);

  const onSubmit = async (data: CourseForm) => {
    try {
      setServerError("");
      await courseService.update(
        id,
        data as unknown as Record<string, unknown>,
      );
      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const fieldErrors = applyApiFieldErrors(err, setError);
      setServerError(
        Object.keys(fieldErrors).length
          ? ""
          : getApiErrorMessage(err, "Could not update course"),
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit course</h1>
        <p className="text-gray-500 mt-1">Update your course details</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Course title"
            error={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                bg-white focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:border-transparent resize-none"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register("categoryId", { required: "Category is required" })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <Input
            label="Price (USD)"
            type="number"
            error={errors.price?.message}
            {...register("price", {
              min: { value: 0, message: "Price cannot be negative" },
            })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              className="w-4 h-4 accent-primary-600"
              {...register("isPublished")}
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              Published - visible to students
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingLabel="Saving..."
            >
              Save changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
