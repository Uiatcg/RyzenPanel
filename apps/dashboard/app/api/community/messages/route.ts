import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import fs from "fs";
import path from "path";

function getCommunityEnabled() {
  try {
    const p = path.join(process.cwd(), "admin-settings.json");
    if (fs.existsSync(p)) {
      const s = JSON.parse(fs.readFileSync(p, "utf8"));
      return s.communityEnabled !== false;
    }
  } catch {}
  return true;
}

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!getCommunityEnabled()) return NextResponse.json({ error: "Community disabled" }, { status: 403 });

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel") || "general";
  const before = url.searchParams.get("before");

  const where: any = { channel };
  if (before) where.createdAt = { lt: new Date(before) };

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, username: true, role: true } },
    },
  });

  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!getCommunityEnabled()) return NextResponse.json({ error: "Community disabled" }, { status: 403 });

  const body = await req.json();
  const { content, channel = "general" } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Message too long (max 500)" }, { status: 400 });
  }

  const lastMsg = await prisma.chatMessage.findFirst({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (lastMsg && (Date.now() - new Date(lastMsg.createdAt).getTime()) < 2000) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      userId: auth.user.id,
      content: content.trim().slice(0, 500),
      channel,
    },
    include: {
      user: { select: { id: true, username: true, role: true } },
    },
  });

  return NextResponse.json({ message });
}

export async function DELETE(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const msg = await prisma.chatMessage.findUnique({ where: { id } });
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (msg.userId !== auth.user.id && auth.user.role !== "ADMIN" && auth.user.role !== "MODERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.chatMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
