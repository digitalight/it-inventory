import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function initializeDefaultAdmin() {
  try {
    console.log("🔧 Checking for default admin user...");

    const adminExists = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (adminExists) {
      console.log("✅ Admin user already exists");
      console.log(`👤 Username: ${adminExists.username}`);
      console.log(`📧 Email: ${adminExists.email}`);
      console.log(`🔑 Password: admin123 (if using default)`);
    } else {
      console.log("🔧 Creating default admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 12);

      const admin = await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          email: "admin@localhost",
          role: "admin",
          isActive: true,
        },
      });

      console.log("✅ Default admin user created successfully!");
      console.log(`👤 Username: ${admin.username}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: admin123`);
      console.log("");
      console.log(
        "⚠️  IMPORTANT: Change the default password after first login!"
      );
    }
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDefaultAdmin();
