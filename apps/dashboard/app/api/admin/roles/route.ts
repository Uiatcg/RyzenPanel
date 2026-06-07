import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const roles = await prisma.rolePermission.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const rolePermissions = await prisma.rolePermission.findMany({
    include: { permission: { select: { id: true, key: true, name: true, description: true } } },
    orderBy: [{ role: "asc" }, { permission: { createdAt: "asc" } }],
  });

  const grouped: Record<string, any[]> = {};
  for (const rp of rolePermissions) {
    if (!grouped[rp.role]) grouped[rp.role] = [];
    grouped[rp.role].push({
      id: rp.id,
      permissionId: rp.permissionId,
      key: rp.permission.key,
      name: rp.permission.name,
      description: rp.permission.description,
      allowed: rp.allowed,
    });
  }

  return NextResponse.json({ roles: grouped });
}

export async function PUT(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { rolePermissionId, allowed } = body;

  if (!rolePermissionId || allowed === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rp = await prisma.rolePermission.update({
    where: { id: rolePermissionId },
    data: { allowed },
  });

  return NextResponse.json({ rolePermission: rp });
}
