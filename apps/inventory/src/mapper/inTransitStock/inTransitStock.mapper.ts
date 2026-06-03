import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { inTransitStockDTO } from "@/types/inTransitStock/inTransitStock.js";
import { customOmit } from "av6-utils";
import { InvInTransitStock } from "@repo/db/generated/prisma/client";
import { toIdValue } from "av6-utils";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toInTransitStockDTO = async (
  data: InvInTransitStock[]
): Promise<inTransitStockDTO[]> => {
  const warehouses = await warehouseService.getAllWarehouse(true);
  const branches = await branchService.getAllBranch(true);
  const items = await itemMasterService.getAllItemMaster(true);

  return Promise.all(
    data.map(async (inStock) => {
      const omittedInStock = customOmit<
        InvInTransitStock,
        BaseModelAttrWoCancel | "fromCcId" | "toCcId" | "itemId"
      >(inStock, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "fromCcId",
        "toCcId",
        "itemId",
      ]);

      const user = inStock.userId
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(inStock.userId)
        : null;
      const fromBranch = inStock.fromCcId
        ? branches.find((br) => br.id === inStock.fromCcId)
        : null;
      const toBranch = inStock.toCcId
        ? branches.find((br) => br.id === inStock.toCcId)
        : null;
      const fromWarehouse = inStock.fromCcId
        ? warehouses.find((wh) => wh.id === inStock.fromCcId)
        : null;
      const toWarehouse = inStock.toCcId
        ? warehouses.find((wh) => wh.id === inStock.toCcId)
        : null;
      const item = items.find((it) => it.id === inStock.itemId);

      const fromCcDTO = fromWarehouse ? fromWarehouse : fromBranch;
      const toCcDTO = toWarehouse ? toWarehouse : toBranch;

      return {
        ...omittedInStock.rest,
        user: toIdValue(user, "name"),
        fromCc: toIdValue(fromCcDTO, "name"),
        toCc: toIdValue(toCcDTO, "name"),
        item: toIdValue(item, "item"),
      };
    })
  );
};
