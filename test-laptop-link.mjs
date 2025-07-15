// Quick test to check if laptopId field works in order creation
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testLaptopOrderLink() {
  try {
    // Get a supplier
    const supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      console.log("No suppliers found");
      return;
    }

    // Get a laptop
    const laptop = await prisma.laptop.findFirst({
      where: {
        status: { in: ["In Repair", "Assigned", "Available"] },
      },
    });

    if (!laptop) {
      console.log("No eligible laptops found");
      return;
    }

    console.log("Found supplier:", supplier.name);
    console.log("Found laptop:", laptop.make, laptop.model, laptop.status);

    // Try to create an order with laptop link
    const order = await prisma.order.create({
      data: {
        name: "Test Laptop Order",
        supplierId: supplier.id,
        requestedBy: "Test User",
        deliveryCost: 10.0,
        totalAmount: 60.0,
        notes: "Test order with laptop link",
        laptopId: laptop.id,
      },
      include: {
        laptop: true,
        supplier: true,
      },
    });

    console.log("Order created successfully!");
    console.log("Order ID:", order.id);
    console.log("Linked laptop:", order.laptop?.make, order.laptop?.model);
    console.log("Supplier:", order.supplier.name);

    // Clean up - delete the test order
    await prisma.order.delete({
      where: { id: order.id },
    });

    console.log("Test order cleaned up");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLaptopOrderLink();
