import { IdValue } from "./global.js";

export interface JwtPayload {
  role: Record<string, string>; // active role
  API_TIME: number;
  expire_at: number;
  username: string;
  email: string;
  contact_no: string;
  [key: string]: unknown;
  id: string;
  uuid: string; // unique identifier for the user session
}
export interface CurrentMapping {
  mappingId: number;
  data: IdValue | null;
}
export type UserType = "EMPLOYEE" | "VENDOR" | "CUSTOMER";
export interface JwtAccessPayload {
  uuid: string;
  tokenVersion: string; // V1 for old tokens, V2 for new tokens
  id: number;
  userId: number;
  name: string;
  username: string;
  email: string | null;
  contactNo: string | null;
  userImgUrl: string | null;
  userType: UserType;
  timezone: string;
  levelId?: number;
  noOfLevels: number;
  currentLevelZero: CurrentMapping | null;
  levelZero: CurrentMapping[];
  currentLevelOne: CurrentMapping | null;
  levelOne: CurrentMapping[];
  currentLevelTwo: CurrentMapping | null;
  levelTwo: CurrentMapping[];
  sessionId: string;
  expireAt: number;
}

export interface JwtRefreshPayload {
  id: number;
  userId: number;
  role: CurrentMapping | null;
  expireAt: number;
}
