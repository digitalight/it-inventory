import { createOrder } from "./app/orders/actions.js";

console.log("Testing laptop-order linking...");

// Create a FormData object with laptop link
const formData = new FormData();
formData.append("name", "Test Laptop Order");
formData.append("supplierId", "test-supplier-id");
formData.append("requestedBy", "Test User");
formData.append("deliveryCost", "10.00");
formData.append("notes", "Test order with laptop link");
formData.append("laptopId", "test-laptop-id");

// Add test items
const items = [
  {
    name: "Test Part",
    quantity: 1,
    unitPrice: 50.0,
    notes: "Test part for laptop repair",
  },
];
formData.append("items", JSON.stringify(items));

try {
  const result = await createOrder(formData);
  console.log("Order creation result:", result);
} catch (error) {
  console.error("Error:", error);
}
