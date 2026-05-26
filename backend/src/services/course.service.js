const prisma = require("../utils/prisma");

// Helper: generate a URL-safe slug from a title
// "My Awesome Course!" → "my-awesome-course"
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

const getAllCourses = async ({ category, search, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit; // pagination offset

  // Build the filter dynamically based on what query params were provided
  const where = {
    isPublished: true, // students only see published courses
    ...(category && {
      category: { slug: category },
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Run both queries in parallel for efficiency
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      include: {
        teacher: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCourseBySlug = async (slug) => {
  const course = await prisma.course.findFirst({
    where: { slug, isPublished: true },
    include: {
      teacher: { select: { id: true, name: true, avatarUrl: true } },
      category: true,
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              durationSeconds: true,
              isFreePreview: true,
              orderIndex: true,
              // videoUrl is intentionally excluded for non-enrolled users
            },
          },
        },
      },
      reviews: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    const error = new Error("Course not found");
    error.status = 404;
    throw error;
  }

  return course;
};

const getMyCourses = async (teacherId) => {
  return prisma.course.findMany({
    where: { teacherId },
    include: {
      category: true,
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createCourse = async ({
  title,
  description,
  categoryId,
  price,
  teacherId,
}) => {
  // Validate the category exists
  console.log("categoryId received:", categoryId, typeof categoryId);
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    const error = new Error("Category not found");
    error.status = 404;
    throw error;
  }

  let slug = generateSlug(title);

  // Ensure slug is unique — if "my-course" exists, try "my-course-2" etc.
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  return prisma.course.create({
    data: {
      title,
      slug,
      description,
      price: price || 0,
      categoryId,
      teacherId,
    },
    include: {
      category: true,
      teacher: { select: { id: true, name: true } },
    },
  });
};

const updateCourse = async ({ courseId, teacherId, data }) => {
  // First verify this teacher owns this course
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    const error = new Error("Course not found");
    error.status = 404;
    throw error;
  }

  // Ownership check — a teacher cannot edit another teacher's course
  if (course.teacherId !== teacherId) {
    const error = new Error("You do not have permission to edit this course");
    error.status = 403;
    throw error;
  }

  // Only allow specific fields to be updated — never let the client
  // update teacherId, slug, or other sensitive fields directly
  const { title, description, categoryId, price, isPublished, thumbnailUrl } =
    data;

  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(categoryId && { categoryId }),
      ...(price !== undefined && { price }),
      ...(isPublished !== undefined && { isPublished }),
      ...(thumbnailUrl && { thumbnailUrl }),
    },
  });
};

const deleteCourse = async ({ courseId, teacherId }) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    const error = new Error("Course not found");
    error.status = 404;
    throw error;
  }

  if (course.teacherId !== teacherId) {
    const error = new Error("You do not have permission to delete this course");
    error.status = 403;
    throw error;
  }

  // Prisma will cascade delete sections and lessons automatically
  // because we set onDelete: Cascade in the schema
  await prisma.course.delete({ where: { id: courseId } });
};

module.exports = {
  getAllCourses,
  getCourseBySlug,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
