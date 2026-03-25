import { InvItemStore, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";

export type ItemStoreReq = Omit<
  Prisma.InvItemStoreUncheckedCreateWithoutPurchaseOrderInput,
  "id"
>;

export interface ItemStoreUpdate extends ItemStoreReq {
  id: number;
}

export interface ItemStoreDTO extends Omit<InvItemStore, BaseModelAttr> {
  collectionCenter: IdValue | null;
}
