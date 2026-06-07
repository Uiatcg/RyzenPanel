import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.creditShopItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, category, cost, ram, cpu, disk, backups } = body;

  if (!name || !category || !cost) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const item = await prisma.creditShopItem.create({
    data: {
      name,
      description: description || "",
      category,
      cost: parseInt(String(cost)),
      ram: ram ? parseInt(String(ram)) : 0,
      cpu: cpu ? parseInt(String(cpu)) : 0,
      disk: disk ? parseInt(String(disk)) : 0,
      backups: backups ? parseInt(String(backups)) : 0,
    },
  });

  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, isActive, ...data } = body;

  if (!id) return NextResponse.json({ error: "Missing item ID" }, { status: 400 });

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.cost !== undefined) updateData.cost = parseInt(String(data.cost));
  if (data.ram !== undefined) updateData.ram = parseInt(String(data.ram));
  if (data.cpu !== undefined) updateData.cpu = parseInt(String(data.cpu));
  if (data.disk !== undefined) updateData.disk = parseInt(String(data.disk));
  if (data.backups !== undefined) updateData.backups = parseInt(String(data.backups));
  if (isActive !== undefined) updateData.isActive = isActive;

  const item = await prisma.creditShopItem.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing item ID" }, { status: 400 });

  await prisma.creditShopItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
