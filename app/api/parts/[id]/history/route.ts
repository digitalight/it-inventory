// app/api/parts/[id]/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PartsManager } from "@/lib/parts-management";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partId = params.id;
    
    if (!partId) {
      return NextResponse.json(
        { error: "Part ID is required" },
        { status: 400 }
      );
    }

    const history = await PartsManager.getPartStockHistory(partId);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch part history:", error);
    return NextResponse.json(
      { error: "Failed to fetch part history" },
      { status: 500 }
    );
  }
}
