export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ tickets: [] });

  const tickets = await prisma.ticket.findMany({
    where: { userId: auth.user.id },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const ticket = await prisma.ticket.create({
    data: {
      userId: auth.user.id,
      subject: body.subject,
      category: body.category || "general",
      priority: body.priority || "MEDIUM",
      status: "OPEN",
      messages: {
        create: { userId: auth.user.id, message: body.message, isAdmin: false },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(ticket, { status: 201 });
}
