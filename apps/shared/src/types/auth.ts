export type Role = "USER" | "ADMIN";

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
