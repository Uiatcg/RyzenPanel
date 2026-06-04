import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const server = await prisma.server.update({
    where: { id: params.id },
    data: { startup: body.startup },
  });
  return NextResponse.json(server);
}
