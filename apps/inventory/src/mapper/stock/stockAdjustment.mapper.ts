import { commonService } from "@/services/common.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  StockAdjDetailDTO,
  StockAdjustmentDetailsDTO,
  StockAdjustmentDTO,
  StockAdjustmentResponse,
} from "@/types/stock/stockAdjustment.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { InvStockAdjustmentDetails } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toStockAdjustmentDTO = async (
  data: StockAdjustmentResponse[],
): Promise<StockAdjustmentDTO[]> => {
  const allBranches = await commonService.getAllElements<"InvBranch">({
    cacheCode: "BRANCH",
    canNullReturnable: true,
    modelName: "InvBranch",
    shortCode: "BRANCH",
    useActiveFlag: true,
  });

  const allWarehouses = await commonService.getAllElements<"InvWarehouse">({
    cacheCode: "WAREHOUSE",
    canNullReturnable: true,
    modelName: "InvWarehouse",
    shortCode: "WAREHOUSE",
    useActiveFlag: true,
  });

  return Promise.all(
    data.map(async (stockAdjustment) => {
      const omittedStockAdjustment = customOmit<
        StockAdjustmentResponse,
        | "ccId"
        | "targetCcId"
        | "isActive"
        | "updatedBy"
        | "updatedAt"
        | "deletedBy"
        | "deletedAt"
        | "stockAdjustmentDetails"
      >(stockAdjustment, [
        "ccId",
        "targetCcId",
        "isActive",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "stockAdjustmentDetails",
      ]);

      const detailDTO: StockAdjustmentDetailsDTO[] = await Promise.all(
        stockAdjustment.stockAdjustmentDetails.map(async (detail) => {
          const omittedDetail = customOmit<
            InvStockAdjustmentDetails,
            | "itemId"
            | "isActive"
            | "deletedBy"
            | "createdAt"
            | "updatedAt"
            | "deletedAt"
          >(detail, [
            "itemId",
            "isActive",
            "deletedBy",
            "createdAt",
            "updatedAt",
            "deletedAt",
          ]);
          const item = detail.itemId
            ? await itemMasterService.getItemMasterById(
                { itemId: detail.itemId },
                true,
              )
            : null;
          const createdBy = detail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.createdBy,
              )
            : null;
          const updatedBy = detail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.updatedBy,
              )
            : null;

          return {
            ...omittedDetail.rest,
            item: item ? await itemMasterToDto(item) : null,
            createdBy,
            updatedBy,
          };
        }),
      );

      const cc =
        allWarehouses.find((c) => c.id === stockAdjustment.ccId) ??
        allBranches.find((c) => c.id === stockAdjustment.ccId) ??
        null;
      const targetCc =
        allWarehouses.find((c) => c.id === stockAdjustment.targetCcId) ??
        allBranches.find((c) => c.id === stockAdjustment.targetCcId) ??
        null;

      return {
        ...omittedStockAdjustment.rest,
        collectionCenter: toIdValue(cc, "name"),
        targetCollectionCenter: toIdValue(targetCc, "name"),
        stockAdjustmentDetails: detailDTO,
      };
    }),
  );
};

export const toStockAdjustmentDetailDTO = async (
  data: InvStockAdjustmentDetails[],
): Promise<StockAdjDetailDTO[]> => {
  return Promise.all(
    data.map(async (detail) => {
      const omittedDetail = customOmit<
        InvStockAdjustmentDetails,
        | "itemId"
        | "isActive"
        | "deletedBy"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "createdBy"
        | "updatedBy"
      >(detail, [
        "itemId",
        "isActive",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "createdBy",
        "updatedBy",
      ]);
      const item = detail.itemId
        ? await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true,
          )
        : null;
      const createdBy = detail.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.createdBy)
        : null;
      const updatedBy = detail.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.updatedBy)
        : null;
      return {
        ...omittedDetail.rest,
        item: item ? await itemMasterToDto(item) : null,
        createdBy,
        updatedBy,
      };
    }),
  );
};
