import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { ItemStoreDTO } from "@/types/master/itemStore.js";
import { getAllBranchAndWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import { InvItemStore } from "@repo/db/generated/prisma/client";

export const toItemStoreDTO = async (
  data: InvItemStore[],
): Promise<ItemStoreDTO[]> => {
  const CollectionCenters = await getAllBranchAndWarehouse();

  const itemStoreDTOs = await Promise.all(
    data.map(async (item) => {
      const omittedItemStore = customOmit<
        InvItemStore,
        BaseModelAttrWoCancel | "ccId"
      >(item, [
        "isActive",
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
      ]);

      const cc = CollectionCenters.find((center) => center.id === item.ccId);

      return {
        ...omittedItemStore.rest,
        collectionCenter: cc ? toIdValue(cc, "name") : null,
      };
    }),
  );

  return itemStoreDTOs;
};
