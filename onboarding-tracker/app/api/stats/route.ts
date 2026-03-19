import { NextResponse } from "next/server";
import { getOnboardingStats } from "@/lib/hubspot";

export async function GET() {
  try {
    const stats = await getOnboardingStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
