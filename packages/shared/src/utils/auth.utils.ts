import {
  JwtAccessPayload,
  JwtPayload,
  JwtRefreshPayload,
} from "@/types/auth.js";
import jwt from "jsonwebtoken";

export function decodeToken(shortToken: string): JwtPayload {
  return jwt.decode(shortToken) as JwtPayload;
}

export const decodeAccessToken = (token: string): JwtAccessPayload => {
  return jwt.decode(token) as JwtAccessPayload;
};

export const decodeRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.decode(token) as JwtRefreshPayload;
};
