import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  StockAdjustmentDetailsDTO,
  StockAdjustmentDTO,
  StockAdjustmentResponse,
} from "@/types/stock/stockAdjustment.js";
import { StockAdjustmentDetails } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";

export const toStockAdjustmentDTO = async (
  input: StockAdjustmentResponse
): Promise<StockAdjustmentDTO> => {
  const cc = await warehouseService.getWarehouseByIdWoDTO(input.ccId, true);
  const warehouse = input.warehouseId
    ? await warehouseService.getWarehouseByIdWoDTO(input.warehouseId, true)
    : null;
  const branch = input.branchId
    ? await branchService.getBranchByIdWoDTO(input.branchId, true)
    : null;
  const createdBy = input.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(input.createdBy, true)
    : null;

  const omittedInput = customOmit<
    StockAdjustmentResponse,
    | "ccId"
    | "branchId"
    | "warehouseId"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "updatedAt"
    | "deletedBy"
    | "deletedAt"
    | "stockAdjustmentDetails"
  >(input, [
    "ccId",
    "branchId",
    "warehouseId",
    "isActive",
    "createdBy",
    "updatedBy",
    "updatedAt",
    "deletedBy",
    "deletedAt",
    "stockAdjustmentDetails",
  ]);

  const detailDTO: StockAdjustmentDetailsDTO[] = await Promise.all(
    input.stockAdjustmentDetails.map(async (detail) => {
      const omittedDetail = customOmit<
        StockAdjustmentDetails,
        | "itemId"
        | "isActive"
        | "createdBy"
        | "updatedBy"
        | "deletedBy"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
      >(detail, [
        "itemId",
        "isActive",
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ]);
      const item = await itemService.getItemByIdWoDTO(detail.itemId, true);

      return {
        ...omittedDetail.rest,
        item,
      };
    })
  );

  return {
    ...omittedInput.rest,
    collectionCenter: cc ? toIdValue(cc, "name") : null,
    branch: branch ? toIdValue(branch, "name") : null,
    warehouse: warehouse ? toIdValue(warehouse, "name") : null,
    stockAdjustmentDetails: detailDTO,
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
  };
};
