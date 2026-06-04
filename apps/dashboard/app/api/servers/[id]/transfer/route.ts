export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { nodeId } = await req.json();
  if (!nodeId) return NextResponse.json({ message: "nodeId required" }, { status: 400 });

  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) return NextResponse.json({ message: "Node not found" }, { status: 404 });

  await prisma.server.update({ where: { id: params.id }, data: { nodeId } });
  await prisma.activityLog.create({ data: { serverId: params.id, userId: auth.user.id, title: "Server Transferred", detail: `Transferred to node: ${node.name}`, status: "SUCCESS" } });

  return NextResponse.json({ success: true });
}
