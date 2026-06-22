import {
  CollectionCenter,
  InvItem,
  InvItemStock,
} from "@repo/db/generated/prisma/client";

export type ReOrderItemData = {
  item: InvItem;
  cc: CollectionCenter;
  quantity: number;
};

export type EarlyExpiryData = {
  itemStock: InvItemStock;
  item: InvItem;
  cc: CollectionCenter;
  quantity: number;
};
