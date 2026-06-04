export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(_req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const original = await prisma.server.findUnique({ where: { id: params.id } });
  if (!original) return NextResponse.json({ message: "Server not found" }, { status: 404 });

  const clone = await prisma.server.create({
    data: {
      name: `${original.name} (Clone)`,
      ownerId: auth.user.id,
      nodeId: original.nodeId,
      eggId: original.eggId,
      cpu: original.cpu,
      ram: original.ram,
      disk: original.disk,
      dockerImage: original.dockerImage,
      startup: original.startup,
      environment: (original.environment || {}) as any,
      status: "INSTALLING",
    },
  });

  await prisma.activityLog.create({ data: { serverId: clone.id, userId: auth.user.id, title: "Server Cloned", detail: `Cloned from ${original.name}`, status: "SUCCESS" } });

  return NextResponse.json(clone, { status: 201 });
}
