export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ownerId } = await req.json();
  if (!ownerId) return NextResponse.json({ message: "ownerId required" }, { status: 400 });

  const newOwner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!newOwner) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const server = await prisma.server.findUnique({ where: { id: params.id } });
  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });
  if (server.ownerId !== auth.user.id && auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.server.update({ where: { id: params.id }, data: { ownerId } });
  await prisma.activityLog.create({
    data: { serverId: params.id, userId: auth.user.id, title: "Ownership Transferred", detail: `Ownership transferred to: ${newOwner.username}`, status: "SUCCESS" },
  });

  return NextResponse.json({ success: true });
}