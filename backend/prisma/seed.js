const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "programming" },
      update: {},
      create: { name: "Programming", slug: "programming" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: { name: "Design", slug: "design" },
    }),
    prisma.category.upsert({
      where: { slug: "business" },
      update: {},
      create: { name: "Business", slug: "business" },
    }),
    prisma.category.upsert({
      where: { slug: "marketing" },
      update: {},
      create: { name: "Marketing", slug: "marketing" },
    }),
  ]);

  console.log(
    "✅ Categories seeded:",
    categories.map((c) => c.name),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
