import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      email: "admin@school.edu",
      role: "admin",
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      password: userPassword,
      email: "user@school.edu",
      role: "user",
    },
  });

  // Create IT support user
  const itPassword = await bcrypt.hash("it123", 12);
  const itUser = await prisma.user.upsert({
    where: { username: "itsupport" },
    update: {},
    create: {
      username: "itsupport",
      password: itPassword,
      email: "it@school.edu",
      role: "user",
    },
  });

  console.log("✅ Users created:");
  console.log("📁 Admin user:", admin.username, "(admin@school.edu)");
  console.log("👤 Regular user:", user.username, "(user@school.edu)");
  console.log("🔧 IT Support:", itUser.username, "(it@school.edu)");
  console.log("");
  console.log("🔑 Login credentials:");
  console.log("Admin: admin / admin123");
  console.log("User: user / user123");
  console.log("IT Support: itsupport / it123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
