import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { storeDTO } from "@/types/master/store.js";
import { Store } from "@repo/db/generated/prisma/client";

export const toStoreDTO = async (store: Store): Promise<storeDTO> => {
  const branchDTO =
    store.branchId !== null
      ? await branchService.getBranchById(store.branchId, true)
      : null;

  const wareHouseDTO =
    store.wareHouseId !== null
      ? await warehouseService.getWarehouseById(store.wareHouseId, true)
      : null;

  return {
    id: store.id,
    name: store.name,
    stockCode: store.stockCode,
    description: store.description,
    branch: branchDTO,
    wareHouse: wareHouseDTO,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
};
