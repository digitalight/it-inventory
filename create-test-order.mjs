// create-test-order.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    // Get a part and supplier
    const part = await prisma.part.findFirst({
      include: { category: true },
    });
    const supplier = await prisma.supplier.findFirst();

    if (!part || !supplier) {
      console.log("Need at least one part and one supplier");
      return;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        name: "Demo Order - Keyboard Order",
        supplierId: supplier.id,
        requestedBy: "Demo User",
        status: "Ordered", // Set to Ordered to show indicator
        deliveryCost: 5,
        totalAmount: 155,
      },
    });

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        name: part.name,
        quantity: 5,
        unitPrice: 30,
        totalPrice: 150,
        notes: `Category: ${part.category.name}`,
      },
    });

    // Set partId
    await prisma.$executeRaw`
      UPDATE OrderItem 
      SET partId = ${part.id} 
      WHERE id = ${orderItem.id}
    `;

    console.log(
      `✅ Created order "${order.name}" with 5 units of "${part.name}"`
    );
    console.log(`Order status: ${order.status}`);
    console.log(`Check the parts page to see the "On Order" indicator!`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
