import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const resetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  password: z.string().min(8),
});

export const settingsSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
});
