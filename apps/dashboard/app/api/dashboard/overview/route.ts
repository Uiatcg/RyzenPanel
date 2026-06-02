import { NextResponse } from "next/server";
import { getOverview } from "@/src/lib/dashboard";

export async function GET() {
  const data = await getOverview();
  return NextResponse.json(data);
}
