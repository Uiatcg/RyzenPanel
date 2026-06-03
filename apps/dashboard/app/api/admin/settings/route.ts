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
  };
}

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
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
    const settings = {
      panelName: body.panelName || "RYZENPANEL",
      logoUrl: body.logoUrl || "/favicon.svg",
      primaryColor: body.primaryColor || "#ef4444",
    };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}
