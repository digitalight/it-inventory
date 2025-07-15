// test-ui-workflow.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testUIWorkflow() {
  try {
    console.log("Testing the complete UI workflow...\n");

    // 1. Check if we have parts with order indicators
    const parts = await prisma.part.findMany({
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });

    console.log(`Found ${parts.length} parts in inventory`);

    // 2. For each part, get pending order quantities
    const partsWithOrderInfo = await Promise.all(
      parts.map(async (part) => {
        try {
          const orderItems = await prisma.$queryRaw`
            SELECT 
              oi.quantity,
              oi.unitPrice,
              o.id as orderId,
              o.name as orderName,
              o.status
            FROM OrderItem oi
            JOIN "Order" o ON oi.orderId = o.id
            WHERE oi.partId = ${part.id}
            AND o.status IN ('Request', 'Quotes', 'Ordered')
          `;

          const onOrderQuantity = orderItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
          return {
            name: part.name,
            stockLevel: part.stockLevel,
            onOrderQuantity,
            pendingOrders: orderItems.length,
          };
        } catch (error) {
          return {
            name: part.name,
            stockLevel: part.stockLevel,
            onOrderQuantity: 0,
            pendingOrders: 0,
          };
        }
      })
    );

    // 3. Show parts with orders
    console.log("\nParts with pending orders:");
    partsWithOrderInfo
      .filter((part) => part.onOrderQuantity > 0)
      .forEach((part) => {
        console.log(
          `  📦 ${part.name}: Stock: ${part.stockLevel}, On Order: ${part.onOrderQuantity} (${part.pendingOrders} orders)`
        );
      });

    // 4. Show parts without orders
    const partsWithoutOrders = partsWithOrderInfo.filter(
      (part) => part.onOrderQuantity === 0
    );
    console.log(`\nParts without pending orders: ${partsWithoutOrders.length}`);

    // 5. Show order status summary
    const orderStatusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    console.log("\nOrder status summary:");
    orderStatusCounts.forEach((status) => {
      console.log(`  ${status.status}: ${status._count.id} orders`);
    });

    console.log("\n✅ UI workflow test completed!");
    console.log("\nNext steps:");
    console.log(
      '1. Go to http://localhost:3003/parts to see "On Order" indicators'
    );
    console.log("2. Create a new order at http://localhost:3003/orders/create");
    console.log('3. Use "Add Part" button to select parts from inventory');
    console.log('4. Set order status to "Ordered" to see indicators');
    console.log('5. Set order status to "Delivered" to update stock levels');
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUIWorkflow();
