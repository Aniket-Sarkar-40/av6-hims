import { ItemStoreDTO } from "@/types/master/itemStore";
import { getAllBranchAndWarehouse, getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { customOmit } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { ItemStore } from "@prisma/client";

export const toItemStoreDTO = async (itemStore: ItemStore): Promise<ItemStoreDTO> => {
  const omittedItemStore = customOmit<
    ItemStore,
    "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "createdAt" | "updatedAt" | "deletedAt"
  >(itemStore, ["isActive", "createdBy", "updatedBy", "deletedBy", "createdAt", "updatedAt", "deletedAt"]);
  const cc = await getBranchOrWarehouse(itemStore.ccId);
  return {
    ...omittedItemStore.rest,
    collectionCenter: cc ? toIdValue(cc, "name") : null,
  };
};

export const toAllItemStoreDTO = async (itemStore: ItemStore[]): Promise<ItemStoreDTO[]> => {
  const collectionCenters = await getAllBranchAndWarehouse();

  const itemStoreDTOs = await Promise.all(
    itemStore.map(async (item) => {
      const omittedItemStore = customOmit<
        ItemStore,
        "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "createdAt" | "updatedAt" | "deletedAt"
      >(item, ["isActive", "createdBy", "updatedBy", "deletedBy", "createdAt", "updatedAt", "deletedAt"]);

      const cc = collectionCenters.find((center) => center.id === item.ccId);

      return {
        ...omittedItemStore.rest,
        collectionCenter: cc ? toIdValue(cc, "name") : null,
      };
    })
  );

  return itemStoreDTOs;
};
