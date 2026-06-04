import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const databases = await prisma.database.findMany({ where: { serverId: params.id } });
  return NextResponse.json({ databases });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = await prisma.database.create({
    data: {
      serverId: params.id,
      database: body.database || `db_${params.id.slice(0, 8)}`,
      username: body.username || `user_${params.id.slice(0, 8)}`,
      password: body.password || crypto.randomUUID().slice(0, 16),
      remote: body.remote || "%",
      host: body.host || "127.0.0.1",
      port: body.port || 3306,
    },
  });
  return NextResponse.json(db, { status: 201 });
}
