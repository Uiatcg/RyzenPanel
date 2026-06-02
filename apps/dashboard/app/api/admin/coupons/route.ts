export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: { code: body.code.toUpperCase(), discount: body.discount, maxUses: body.maxUses || 0, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null },
  });
  return NextResponse.json(coupon, { status: 201 });
}
