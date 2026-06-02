import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../constants";

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
