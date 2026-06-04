export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ announcements });
}

export async function POST(req: Request) {
  const body = await req.json();
  const announcement = await prisma.announcement.create({
    data: { title: body.title, content: body.content, isActive: body.isActive ?? true },
  });
  return NextResponse.json(announcement, { status: 201 });
}
