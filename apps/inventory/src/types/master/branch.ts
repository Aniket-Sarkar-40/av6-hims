import {
  CollectionCenter,
  InvBranch,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";

export type BranchReq = Prisma.InvBranchUncheckedCreateInput;
export interface BranchDTO extends Omit<InvBranch, BaseModelAttr> {
  collectionCenter: CollectionCenter | null;
}
export interface BranchDTOLocation extends Omit<InvBranch, BaseModelAttr> {
  collectionCenter: CollectionCenter | null;
}

export type BranchDropDown = IdValue;

export type BranchResponse = Prisma.InvBranchGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;
