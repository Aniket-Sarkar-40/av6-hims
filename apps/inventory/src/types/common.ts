import { InvDynamicShortCode } from "@repo/db/generated/prisma/client";

export interface LockUnlockParams {
  shortCode: string;
  id: number;
}

export interface LockUnlockRequestRepository extends LockUnlockParams {
  shortCodeData: InvDynamicShortCode;
}

export interface ToggleActive {
  id: number;
  action: "ACTIVE" | "IN_ACTIVE";
}
