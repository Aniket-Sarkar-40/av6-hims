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
  data: InvInTransitStock[],
): Promise<inTransitStockDTO[]> => {
  const warehouses = await warehouseService.getAllWarehouse(true);
  const branches = await branchService.getAllBranch(true);
  const items = await itemMasterService.getAllItemMaster(true);

  return Promise.all(
    data.map(async (inStock) => {
      const omittedInStock = customOmit<
        InvInTransitStock,
        BaseModelAttrWoCancel | "fromId" | "toId" | "itemId"
      >(inStock, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "fromId",
        "toId",
        "itemId",
      ]);

      const fromUser = await employeeService.getEmployeeByIdFrmCacheOrDb(
        inStock.fromId,
        true,
      );
      const toWarehouse = warehouses.find((wh) => wh.id === inStock.toId);
      const toBranch = branches.find((br) => br.id === inStock.toId);
      const item = items.find((it) => it.id === inStock.itemId);

      const toDTO = toWarehouse ? toWarehouse : toBranch;

      return {
        ...omittedInStock.rest,
        from: toIdValue(fromUser, "name"),
        to: toDTO ? toIdValue(toDTO, "name") : null,
        item: item ? toIdValue(item, "item") : null,
      };
    }),
  );
};
