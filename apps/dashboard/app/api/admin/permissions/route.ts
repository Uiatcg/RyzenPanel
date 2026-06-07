import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const permissions = await prisma.permission.findMany({
    orderBy: { createdAt: "asc" },
    include: { rolePermissions: { select: { role: true, allowed: true, id: true } } },
  });

  return NextResponse.json({ permissions });
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { key, name, description } = body;
  if (!key || !name) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const permission = await prisma.permission.create({
    data: { key, name, description },
    include: { rolePermissions: { select: { role: true, allowed: true, id: true } } },
  });

  for (const role of ["USER", "MODERATOR", "ADMIN"] as const) {
    await prisma.rolePermission.create({
      data: { role, permissionId: permission.id, allowed: role === "ADMIN" },
    });
  }

  return NextResponse.json({ permission });
}
