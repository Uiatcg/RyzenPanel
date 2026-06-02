export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } from "@ryzenpanel/shared/src/constants";

export async function GET() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
  });
  return NextResponse.redirect("https://github.com/login/oauth/authorize?" + params.toString());
}
