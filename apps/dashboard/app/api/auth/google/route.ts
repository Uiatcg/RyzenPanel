export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, BASE_URL } from "@ryzenpanel/shared/src/constants";

export async function GET() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
  });
  return NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
}
