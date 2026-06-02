export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(_req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const server = await prisma.server.findUnique({ where: { id: params.id } });
  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });

  await prisma.server.update({ where: { id: params.id }, data: { status: "INSTALLING" } });
  await prisma.activityLog.create({ data: { serverId: params.id, userId: auth.user.id, title: "Server Reinstalling", detail: `Server ${server.name} reinstall started`, status: "WARNING" } });

  return NextResponse.json({ success: true });
}
