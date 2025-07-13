import { PrismaClient } from "@prisma/client";

async function getLaptopId() {
  try {
    const prisma = new PrismaClient();

    const laptop = await prisma.laptop.findFirst({
      select: {
        id: true,
        make: true,
        model: true,
        serialNumber: true,
      },
    });

    if (laptop) {
      console.log(`Laptop ID: ${laptop.id}`);
      console.log(
        `Details: ${laptop.make} ${laptop.model} (${laptop.serialNumber})`
      );
      console.log(`Test URL: http://localhost:3000/laptops/${laptop.id}`);
    } else {
      console.log("No laptops found");
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

getLaptopId();
