import { NextResponse } from "next/server";
import { getServers } from "@/src/lib/dashboard";

export async function GET() {
  const data = await getServers();
  return NextResponse.json(data);
}
