// Test the server action
import { getLaptopHistory } from "./app/laptops/history-actions.js";

async function testAction() {
  try {
    // Use a known laptop ID
    const laptopId = "08d573c2-cbfb-4f3c-aeed-a1be9d3c22e6";
    console.log("Testing server action for laptop:", laptopId);

    const result = await getLaptopHistory(laptopId);
    console.log("Server action result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error testing server action:", error);
  }
}

testAction();
