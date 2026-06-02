import { auth } from "@/src/lib/auth-utils";
import { getOverview, getServers, getActivity } from "@/src/lib/dashboard";
import { HomeClient } from "./HomeClient";

export default async function DashboardPage() {
  const user = await auth();
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
    />
  );
}
