import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  ItemStockAuditDetails,
  StockAuditDTO,
  StockResponse,
} from "@/types/stock/stock.js";
import { customOmit } from "av6-core-v2";
import { PmsItemStock } from "@repo/db/generated/prisma/client";

export const toStockAuditDTO = async (
  stockAudit: ItemStockAuditDetails,
): Promise<StockAuditDTO> => {
  const createdBy = stockAudit.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockAudit.createdBy,
        true,
      )
    : null;

  const omittedStock = customOmit<
    PmsItemStock,
    "itemId" | "warehouseId" | "branchId"
  >(stockAudit.itemStock, ["itemId", "warehouseId", "branchId"]);

  const itemStock: StockResponse = {
    ...omittedStock.rest,
    item: await itemService.getItemByIdWoDTO(stockAudit.itemStock.itemId),
    branch: stockAudit.itemStock.branchId
      ? await branchService.getBranchByIdWoDTO(
          stockAudit.itemStock.branchId,
          true,
        )
      : null,
    warehouse: stockAudit.itemStock.warehouseId
      ? await warehouseService.getWarehouseByIdWoDTO(
          stockAudit.itemStock.warehouseId,
          true,
        )
      : null,
  };

  const omittedStockAudit = customOmit<
    ItemStockAuditDetails,
    "itemStockId" | "createdBy"
  >(stockAudit, ["itemStockId", "createdBy"]);

  return {
    ...omittedStockAudit.rest,
    itemStock: itemStock,
    createdBy: createdBy,
  };
};
