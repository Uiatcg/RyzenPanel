import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const ticket = await prisma.ticket.findFirst({
    where: { id: params.id, userId: auth.user.id },
    include: { messages: { include: { user: { select: { username: true, role: true } } }, orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === "close") {
    await prisma.ticket.update({ where: { id: params.id }, data: { status: "CLOSED" } });
    return NextResponse.json({ success: true });
  }

  const message = await prisma.ticketMessage.create({
    data: { ticketId: params.id, userId: auth.user.id, message: body.message, isAdmin: auth.user.role === "ADMIN" },
  });

  await prisma.ticket.update({ where: { id: params.id }, data: { status: "REPLIED" } });
  return NextResponse.json(message, { status: 201 });
}
