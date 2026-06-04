export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || name.trim().length < 3) {
    return NextResponse.json({ message: "Server name must be at least 3 characters" }, { status: 400 });
  }

  const server = await prisma.server.update({
    where: { id: params.id },
    data: { name: name.trim() },
  });

  await prisma.activityLog.create({
    data: { serverId: params.id, userId: auth.user.id, title: "Server Renamed", detail: `Server renamed to: ${name.trim()}`, status: "SUCCESS" },
  });

  return NextResponse.json({ server });
}