import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  StockAdjustmentDetailsDTO,
  StockAdjustmentDTO,
  StockAdjustmentResponse,
} from "@/types/stock/stockAdjustment.js";
import { InvStockAdjustmentDetails } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toStockAdjustmentDTO = async (
  data: StockAdjustmentResponse[],
): Promise<StockAdjustmentDTO[]> => {
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
          const item = await itemMasterService.getItemMasterByIdWoDto(
            detail.itemId,
            true,
          );

          return {
            ...omittedDetail.rest,
            item,
          };
        }),
      );

      return {
        ...omittedStockAdjustment.rest,
        collectionCenter: toIdValue(stockAdjustment.cc, "colName"),
        targetCollectionCenter: toIdValue(stockAdjustment.targetCc, "colName"),
        stockAdjustmentDetails: detailDTO,
      };
    }),
  );
};
