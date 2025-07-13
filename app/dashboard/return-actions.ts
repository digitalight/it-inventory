// app/dashboard/return-actions.ts
"use server";

import { LaptopManager } from "@/lib/laptop-management";
import { revalidatePath } from "next/cache";

export async function returnLaptop(laptopId: string, staffId: string, notes?: string) {
  try {
    // Update laptop status to "Returned" which will automatically unassign it
    await LaptopManager.updateLaptopStatus(laptopId, "Returned", {
      reason: "Laptop returned by leaving staff member",
      changedBy: "Dashboard - Staff Departure",
      notes: notes || undefined
    });

    // Revalidate the dashboard to show updated data
    revalidatePath("/");
    
    return { success: true, message: "Laptop successfully returned" };
  } catch (error) {
    console.error("Failed to return laptop:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to return laptop" 
    };
  }
}
