const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const register = async ({ name, email, password, role }) => {
  // 1. Check if email is already taken
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    const error = new Error("Email already in use");
    error.status = 409; // 409 Conflict
    throw error;
  }

  // 2. Hash the password
  // The number 12 is the "salt rounds" — higher = more secure but slower
  // 12 is the industry standard balance for production
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role?.toUpperCase() || "STUDENT",
    },
    // Never return the passwordHash to the client
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // 4. Generate a JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role }, // payload — data stored inside the token
    process.env.JWT_SECRET, // secret key — only your server knows this
    { expiresIn: "7d" }, // token expires in 7 days
  );

  return { user, token };
};

const login = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Use the same vague error for both "user not found" and "wrong password"
  // This prevents attackers from knowing which emails exist in your system
  const invalidError = new Error("Invalid email or password");
  invalidError.status = 401;

  if (!user) throw invalidError;

  // 2. Compare the provided password against the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw invalidError;

  // 3. Generate token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // 4. Return user (without password) and token
  const { passwordHash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

module.exports = { register, login };
