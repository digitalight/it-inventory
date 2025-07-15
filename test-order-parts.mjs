// test-order-parts.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testOrderPartsFlow() {
  try {
    // 1. Get a part to test with
    const parts = await prisma.part.findMany({
      take: 1,
      include: {
        category: true,
      },
    });

    if (parts.length === 0) {
      console.log("No parts found in database");
      return;
    }

    const testPart = parts[0];
    console.log("Using test part:", testPart.name);

    // 2. Get a supplier
    const suppliers = await prisma.supplier.findMany({ take: 1 });
    if (suppliers.length === 0) {
      console.log("No suppliers found in database");
      return;
    }

    const testSupplier = suppliers[0];
    console.log("Using supplier:", testSupplier.name);

    // 3. Create an order with the part
    const order = await prisma.order.create({
      data: {
        name: "Test Order - Parts Integration",
        supplierId: testSupplier.id,
        requestedBy: "Test User",
        status: "Request",
        deliveryCost: 0,
        totalAmount: 50,
      },
    });

    console.log("Created order:", order.name);

    // 4. Create order item with partId
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        name: testPart.name,
        quantity: 2,
        unitPrice: 25,
        totalPrice: 50,
        notes: `Part Number: ${testPart.partNumber || "N/A"}`,
      },
    });

    console.log("Created order item:", orderItem.name);

    // 5. Update the order item with partId using raw SQL
    await prisma.$executeRaw`
      UPDATE OrderItem 
      SET partId = ${testPart.id} 
      WHERE id = ${orderItem.id}
    `;

    console.log("Updated order item with partId:", testPart.id);

    // 6. Check if the part now shows as "on order"
    const orderItems = await prisma.$queryRaw`
      SELECT 
        oi.quantity,
        oi.unitPrice,
        o.id as orderId,
        o.name as orderName,
        o.status
      FROM OrderItem oi
      JOIN "Order" o ON oi.orderId = o.id
      WHERE oi.partId = ${testPart.id}
      AND o.status IN ('Request', 'Quotes', 'Ordered')
    `;

    console.log("Order items for part:", orderItems);

    // 7. Test order status change to "Ordered"
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "Ordered" },
    });

    console.log('Updated order status to "Ordered"');

    // 8. Check again
    const orderItemsAfterUpdate = await prisma.$queryRaw`
      SELECT 
        oi.quantity,
        oi.unitPrice,
        o.id as orderId,
        o.name as orderName,
        o.status
      FROM OrderItem oi
      JOIN "Order" o ON oi.orderId = o.id
      WHERE oi.partId = ${testPart.id}
      AND o.status IN ('Request', 'Quotes', 'Ordered')
    `;

    console.log("Order items after status update:", orderItemsAfterUpdate);

    const onOrderQuantity = orderItemsAfterUpdate.reduce(
      (total, item) => total + item.quantity,
      0
    );
    console.log("Total on order quantity:", onOrderQuantity);

    // 9. Test delivery and stock update
    console.log("Original stock level:", testPart.stockLevel);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "Delivered", deliveredAt: new Date() },
    });

    // Get the order with items for delivery processing
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    // Process delivery - update stock levels
    for (const item of orderWithItems.items) {
      try {
        const itemWithPart = await prisma.$queryRaw`
          SELECT partId FROM OrderItem WHERE id = ${item.id}
        `;

        if (itemWithPart.length > 0 && itemWithPart[0].partId) {
          const partId = itemWithPart[0].partId;

          const part = await prisma.part.findUnique({
            where: { id: partId },
          });

          if (part) {
            await prisma.part.update({
              where: { id: partId },
              data: {
                stockLevel: {
                  increment: item.quantity,
                },
              },
            });

            await prisma.partStockHistory.create({
              data: {
                partId: partId,
                changeType: "Order Delivered",
                quantity: item.quantity,
                previousStock: part.stockLevel,
                newStock: part.stockLevel + item.quantity,
                reason: `Order delivered: ${orderWithItems.name}`,
                changedBy: "System",
                notes: `Order ID: ${order.id}, Item: ${item.name}`,
              },
            });

            console.log(
              `Updated part ${part.name} stock from ${part.stockLevel} to ${
                part.stockLevel + item.quantity
              }`
            );
          }
        }
      } catch (error) {
        console.error("Error processing delivery:", error);
      }
    }

    // 10. Verify final stock level
    const updatedPart = await prisma.part.findUnique({
      where: { id: testPart.id },
    });

    console.log("Final stock level:", updatedPart.stockLevel);
    console.log(
      "Stock increase:",
      updatedPart.stockLevel - testPart.stockLevel
    );

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderPartsFlow();
