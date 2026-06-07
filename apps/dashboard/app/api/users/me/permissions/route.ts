import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: auth.user.role as any, allowed: true },
    include: { permission: { select: { key: true } } },
  });

  const permissions = rolePermissions.map(rp => rp.permission.key);

  return NextResponse.json({ role: auth.user.role, permissions });
}
