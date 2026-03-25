import { branchService } from "@/services/master/branch.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { warehouseService } from "@/services/master/warehouse.service";
import { inTransitStockDTO } from "@/types/inTransitStock/inTransitStock";
import { customOmit } from "@/utils/helper.utils";
import { InTransitStock } from "@prisma/client";
import { coreRequests } from "@/client/core/request";
import { toIdValue } from "@/utils/idValue.utils";

export const toInTransitStockDTO = async (inStock: InTransitStock): Promise<inTransitStockDTO> => {
  const omitted = customOmit<InTransitStock, "fromId" | "toId" | "itemId" | "isActive">(inStock, [
    "fromId",
    "toId",
    "itemId",
    "isActive",
  ]);

  const fromUser = await coreRequests.getEmployeeCache(inStock.fromId);
  const toWarehouse = await warehouseService.getWarehouseById(inStock.toId, true);
  const toBranch = await branchService.getBranchById(inStock.toId, true);
  const item = await itemMasterService.getItemMasterByIdWoDto(inStock.itemId, true);

  const toDTO = toWarehouse ? toWarehouse : toBranch;

  return {
    ...omitted.rest,
    from: toIdValue(fromUser, "name"),
    to: toIdValue(toDTO, "name"),
    item: toIdValue(item, "item"),
  };
};
