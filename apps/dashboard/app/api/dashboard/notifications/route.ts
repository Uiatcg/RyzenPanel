import { NextResponse } from "next/server";
import { getNotifications } from "@/src/lib/dashboard";

export async function GET() {
  const data = await getNotifications();
  return NextResponse.json(data);
}
