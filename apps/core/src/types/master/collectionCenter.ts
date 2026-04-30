import { Prisma } from "@repo/db/generated/prisma/client";

export type CollectionCenterReq = Prisma.CollectionCenterUncheckedCreateInput;

export interface CollectionCenterDTO {
  id: number;
  name: string;
  // add optional fields if they exist in your schema (safe to extend later)
  // code?: string | null;
  // type?: string | null;
}
