import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "admin-settings.json");

function getDefaultSettings() {
  return {
    panelName: "RYZENPANEL",
    logoUrl: "/favicon.svg",
    primaryColor: "#ef4444",
    heroImageUrl: "",
    heroVideoUrl: "",
    bannerUrl: "",
    tagline: "The ultimate Minecraft server hosting experience. Deploy, manage, and scale your servers with ease.",
    creditsEnabled: true,
    freeServersEnabled: true,
    adRewardCredits: 10,
    dailyRewardCredits: 5,
    communityEnabled: true,
    audioEnabled: false,
    audioUrl: "",
    announcementsEnabled: true,
    ticketsEnabled: true,
  };
}

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return { ...getDefaultSettings(), ...JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) };
    }
  } catch {}
  return getDefaultSettings();
}

export async function GET() {
  return NextResponse.json(readSettings());
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = readSettings();
    const settings = { ...current, ...body };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}
