"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { courseService } from "@/services/course.service";
import { categoryService } from "@/services/category.service";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Category {
  id: string;
  name: string;
}

interface CourseForm {
  title: string;
  description: string;
  categoryId: string;
  price: number;
}

export default function NewCoursePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseForm>();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "TEACHER") {
      router.push("/login");
      return;
    }
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getAll();
        setCategories(result.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [isAuthenticated, router, user?.role]);

  const onSubmit = async (data: CourseForm) => {
    try {
      setError("");
      await courseService.create(data);
      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create a new course
        </h1>
        <p className="text-gray-500 mt-1">Fill in the details to get started</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Course title"
            placeholder="e.g. Complete Node.js Bootcamp"
            error={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="What will students learn in this course?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200
                bg-white focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:border-transparent placeholder:text-gray-400 resize-none"
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
            placeholder="0 for free"
            error={errors.price?.message}
            {...register("price", {
              min: { value: 0, message: "Price cannot be negative" },
            })}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              Create course
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
