export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(_req);
  if (!auth || auth.user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await prisma.server.update({ where: { id: params.id }, data: { suspended: false, status: "OFFLINE" } });
  await prisma.activityLog.create({ data: { serverId: params.id, userId: auth.user.id, title: "Server Unsuspended", status: "SUCCESS" } });

  return NextResponse.json({ success: true });
}
