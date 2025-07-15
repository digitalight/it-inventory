import { getParts } from "./app/parts/actions.js";

async function testGetParts() {
  try {
    console.log("Testing getParts function...");
    const parts = await getParts();
    console.log("Parts loaded successfully:", parts.length, "parts found");

    if (parts.length > 0) {
      console.log("First part:", {
        id: parts[0].id,
        name: parts[0].name,
        stockLevel: parts[0].stockLevel,
        category: parts[0].category?.name,
      });
    }
  } catch (error) {
    console.error("Error loading parts:", error);
  }
}

testGetParts();
