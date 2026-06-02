import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const activity = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ activity });
  } catch (err) {
    return NextResponse.json({ activity: [] });
  }
}
