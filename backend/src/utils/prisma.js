const { PrismaClient } = require("@prisma/client");

// We create ONE instance of PrismaClient and reuse it everywhere
// Why? Each PrismaClient opens a connection pool to the database
// Creating a new one on every request would exhaust your connections
// This pattern is called a singleton

const prisma = new PrismaClient();

module.exports = prisma;
