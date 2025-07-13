// app/laptops/history-actions.ts
"use server";

import { LaptopManager } from "@/lib/laptop-management";

export async function getLaptopHistory(laptopId: string) {
  try {
    const history = await LaptopManager.getLaptopHistory(laptopId);
    return { success: true, data: history };
  } catch (error) {
    console.error('Failed to get laptop history:', error);
    return { success: false, error: 'Failed to load laptop history' };
  }
}
