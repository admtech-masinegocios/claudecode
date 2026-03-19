import { NextRequest, NextResponse } from "next/server";
import { getContactsPendingOnboarding } from "@/lib/hubspot";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const after = searchParams.get("after") || undefined;

  try {
    const data = await getContactsPendingOnboarding(limit, after);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
