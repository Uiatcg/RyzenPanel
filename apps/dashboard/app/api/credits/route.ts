import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "overview";

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { credits: true, username: true, email: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (tab === "history") {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ credits: user.credits, transactions });
  }

  if (tab === "shop") {
    const items = await prisma.creditShopItem.findMany({
      where: { isActive: true },
      orderBy: { cost: "asc" },
    });
    return NextResponse.json({ credits: user.credits, items });
  }

  const [recentTransactions, totalEarned, totalSpent] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.creditTransaction.aggregate({
      where: { userId: auth.user.id, amount: { gt: 0 } },
      _sum: { amount: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { userId: auth.user.id, amount: { lt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  const lastDaily = await prisma.creditTransaction.findFirst({
    where: { userId: auth.user.id, type: "EARN_DAILY" },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const lastDailyDate = lastDaily ? new Date(lastDaily.createdAt) : null;
  const canClaimDaily = !lastDailyDate ||
    lastDailyDate.toDateString() !== now.toDateString();

  return NextResponse.json({
    credits: user.credits,
    recentTransactions,
    totalEarned: totalEarned._sum.amount || 0,
    totalSpent: Math.abs(totalSpent._sum.amount || 0),
    canClaimDaily,
  });
}
