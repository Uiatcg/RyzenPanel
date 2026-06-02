import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { containerId } = await req.json();
  if (!containerId) {
    return NextResponse.json({ message: "containerId required" }, { status: 400 });
  }

  const server = await prisma.server.update({
    where: { id: params.id },
    data: { containerId, status: "ONLINE" },
  });

  return NextResponse.json(server);
}
