import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { inTransitStockDTO } from "@/types/inTransitStock/inTransitStock.js";
import { PmsInTransitStock } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core";

export const toInTransitStockDTO = async (
  inStock: PmsInTransitStock,
): Promise<inTransitStockDTO> => {
  const omitted = customOmit<
    PmsInTransitStock,
    "fromId" | "toId" | "itemId" | "isActive"
  >(inStock, ["fromId", "toId", "itemId", "isActive"]);
  const formWarehouse = await warehouseService.getWarehouseById(
    inStock.fromId,
    true,
  );
  const toWarehouse = await warehouseService.getWarehouseById(
    inStock.toId,
    true,
  );
  const fromBranch = await branchService.getBranchById(inStock.fromId, true);
  const toBranch = await branchService.getBranchById(inStock.toId, true);
  const item = await itemService.getItemByIdWoDTO(inStock.itemId, true);

  const fromDTO = formWarehouse ? formWarehouse : fromBranch;
  const toDTO = toWarehouse ? toWarehouse : toBranch;

  return {
    ...omitted.rest,
    from: fromDTO,
    to: toDTO,
    item: item,
  };
};
