import { NextResponse } from "next/server";
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from "@ryzenpanel/shared/src/constants";

export async function GET() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
    prompt: "consent",
  });

  return NextResponse.redirect("https://discord.com/api/oauth2/authorize?" + params.toString());
}
