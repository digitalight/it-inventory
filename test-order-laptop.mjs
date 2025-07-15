// Test the order query with laptop data
import { OrderManager } from "./lib/order-management.js";

async function testOrdersWithLaptop() {
  try {
    console.log("Testing order queries with laptop data...");

    const orders = await OrderManager.getOrders();
    console.log("Orders count:", orders.length);

    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log("First order:", {
        id: firstOrder.id,
        name: firstOrder.name,
        laptopId: firstOrder.laptopId,
        laptop: firstOrder.laptop || "NO LAPTOP DATA",
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testOrdersWithLaptop();
