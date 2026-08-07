import { BloodCollectionItemDTO } from "@/types/bloodCollectionItem/bloodCollectionItem.js";
import { BloodCollection, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type BloodCollectionItem = Omit<
  Prisma.BloodCollectionItemUncheckedCreateInput,
  BaseModelAttrWoCancel | "bloodBankCenterId" | "collectionId"
>;

export interface CreateOrUpdateBloodCollection extends Omit<
  Prisma.BloodCollectionUncheckedCreateInput,
  BaseModelAttr
> {
  collectionItems: BloodCollectionItem[];
}

export interface BloodCollectionDTO extends Omit<
  BloodCollection,
  | BaseModelAttrWoCancel
  | "bloodBankCenterId"
  | "donorId"
  | "physicalExamId"
  | "externalCenterId"
  | "receivedByStaffId"
  | "items"
> {
  bloodBankCenter: IdValue | null;
  donor: IdValue | null;
  externalCenter: IdValue | null;
  receivedByStaff: IdValue | null;
  items: BloodCollectionItemDTO[];
}

export type BloodCollectionResponse = Prisma.BloodCollectionGetPayload<{
  include: {
    items: {
      where: {
        isActive: true;
      };
    };
  };
}>;
