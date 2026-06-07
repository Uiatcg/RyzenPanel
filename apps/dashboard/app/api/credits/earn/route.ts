import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { method } = body;

  const settingsPath = require("path").join(process.cwd(), "admin-settings.json");
  let settings = { creditsEnabled: true, freeServersEnabled: true, adRewardCredits: 10, dailyRewardCredits: 5 };
  try {
    if (require("fs").existsSync(settingsPath)) {
      settings = { ...settings, ...JSON.parse(require("fs").readFileSync(settingsPath, "utf8")) };
    }
  } catch {}

  if (method === "daily") {
    if (!settings.creditsEnabled) {
      return NextResponse.json({ error: "Credits system is disabled" }, { status: 400 });
    }

    const lastDaily = await prisma.creditTransaction.findFirst({
      where: { userId: auth.user.id, type: "EARN_DAILY" },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    if (lastDaily && new Date(lastDaily.createdAt).toDateString() === now.toDateString()) {
      return NextResponse.json({ error: "Already claimed today" }, { status: 400 });
    }

    const amount = settings.dailyRewardCredits || 5;
    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: { credits: { increment: amount } },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: auth.user.id,
        type: "EARN_DAILY",
        amount,
        balance: updated.credits,
      },
    });

    return NextResponse.json({ credits: updated.credits, earned: amount });
  }

  if (method === "ad") {
    if (!settings.creditsEnabled) {
      return NextResponse.json({ error: "Credits system is disabled" }, { status: 400 });
    }

    const lastAd = await prisma.creditTransaction.findFirst({
      where: { userId: auth.user.id, type: "EARN_AD" },
      orderBy: { createdAt: "desc" },
    });

    const now = Date.now();
    if (lastAd && (now - new Date(lastAd.createdAt).getTime()) < 60000) {
      return NextResponse.json({ error: "Wait 60 seconds between ad watches" }, { status: 400 });
    }

    const amount = settings.adRewardCredits || 10;
    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: { credits: { increment: amount } },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: auth.user.id,
        type: "EARN_AD",
        amount,
        balance: updated.credits,
      },
    });

    return NextResponse.json({ credits: updated.credits, earned: amount });
  }

  return NextResponse.json({ error: "Invalid method" }, { status: 400 });
}
