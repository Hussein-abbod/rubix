import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to MySQL via Prisma");
  } catch (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
};

export default prisma;
