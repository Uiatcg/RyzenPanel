import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const backups = await prisma.backup.findMany();
    return NextResponse.json({ backups });
  } catch (err) {
    // Return empty list if database is unavailable during build
    return NextResponse.json({ backups: [] });
  }
}
