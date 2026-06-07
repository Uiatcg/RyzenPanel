export type Role = "USER" | "MODERATOR" | "ADMIN";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}

export interface DiscordProfile {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
}
