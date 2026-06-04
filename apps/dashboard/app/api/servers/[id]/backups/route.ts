import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const backups = await prisma.backup.findMany({
    where: { serverId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ backups });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const backup = await prisma.backup.create({
    data: {
      serverId: params.id,
      name: body.name || `Backup ${new Date().toLocaleDateString()}`,
    },
  });
  return NextResponse.json(backup, { status: 201 });
}
