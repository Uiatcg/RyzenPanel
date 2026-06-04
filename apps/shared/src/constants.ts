export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "ryzenpanel_token";
export const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_in_production";
export const JWT_EXPIRES_IN = "30d";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? "";
export const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI ?? "http://localhost:3000/api/auth/discord/callback";

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/api/auth/github/callback";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
