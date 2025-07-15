import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCompleteWorkflow() {
  try {
    console.log("=== Testing Complete Laptop-Order Linking Workflow ===");

    // Get a supplier and laptop for testing
    const supplier = await prisma.supplier.findFirst();
    const laptop = await prisma.laptop.findFirst({
      where: {
        status: { in: ["In Repair", "Assigned", "Available"] },
      },
    });

    if (!supplier || !laptop) {
      console.log("Missing test data - supplier or laptop not found");
      return;
    }

    console.log("✓ Found supplier:", supplier.name);
    console.log(
      "✓ Found laptop:",
      laptop.make,
      laptop.model,
      `(${laptop.status})`
    );

    // Create an order with laptop link
    const order = await prisma.order.create({
      data: {
        name: "Laptop Repair Order - Test",
        supplierId: supplier.id,
        requestedBy: "Test Admin",
        deliveryCost: 15.0,
        totalAmount: 75.0,
        notes: "Testing laptop-order relationship",
        laptopId: laptop.id,
      },
      include: {
        laptop: true,
        supplier: true,
      },
    });

    console.log("✓ Created order:", order.id);
    console.log("✓ Linked to laptop:", order.laptop?.make, order.laptop?.model);

    // Add an order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        name: "Replacement Screen",
        quantity: 1,
        unitPrice: 60.0,
        totalPrice: 60.0,
        notes: "For laptop repair",
      },
    });

    console.log("✓ Added order item:", orderItem.name);

    // Test the query that the orders page uses
    console.log("\n=== Testing Orders Page Query ===");

    const orders = await prisma.order.findMany({
      where: { status: { not: "Delivered" } },
      include: {
        supplier: true,
        laptop: true,
        items: true,
        documents: true,
        _count: {
          select: {
            items: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const testOrder = orders.find((o) => o.id === order.id);
    if (testOrder) {
      console.log("✓ Found order in listing");
      console.log("✓ Laptop data present:", !!testOrder.laptop);
      if (testOrder.laptop) {
        console.log(
          "  - Laptop:",
          testOrder.laptop.make,
          testOrder.laptop.model
        );
        console.log("  - Status:", testOrder.laptop.status);
        console.log("  - Device Name:", testOrder.laptop.deviceName || "None");
      }
    } else {
      console.log("✗ Order not found in listing");
    }

    // Clean up
    await prisma.orderItem.delete({ where: { id: orderItem.id } });
    await prisma.order.delete({ where: { id: order.id } });

    console.log("\n✓ Test completed successfully - cleanup done");
  } catch (error) {
    console.error("Error in test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteWorkflow();
