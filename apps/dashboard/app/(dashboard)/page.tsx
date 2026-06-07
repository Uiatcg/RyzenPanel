import { auth } from "@/src/lib/auth-utils";
import { getOverview, getServers, getActivity } from "@/src/lib/dashboard";
import { HomeClient } from "./HomeClient";
import fs from "fs";
import path from "path";

function getBrandSettings() {
  try {
    const settingsPath = path.join(process.cwd(), "admin-settings.json");
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    }
  } catch {}
  return {
    panelName: "RYZENPANEL",
    logoUrl: "/favicon.svg",
    primaryColor: "#ef4444",
  };
}

export default async function DashboardPage() {
  const user = await auth();
  const brandSettings = getBrandSettings();
  
  const [overview, serversData, activityData] = await Promise.all([
    getOverview(user?.id),
    getServers(user?.id),
    getActivity(user?.id),
  ]);

  return (
    <HomeClient
      user={user}
      overview={overview}
      servers={serversData.servers}
      activity={activityData.activity}
      brandSettings={brandSettings}
    />
  );
}
