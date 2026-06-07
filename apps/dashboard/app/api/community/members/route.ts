import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  const members = await prisma.user.findMany({
    where: search ? {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    } : undefined,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
      _count: { select: { servers: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ members });
}
