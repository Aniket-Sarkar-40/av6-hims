import { itemMasterService } from "@/services/master/itemMaster.service";
import { StockAdjustmentDetailsDTO, StockAdjustmentDTO, StockAdjustmentResponse } from "@/types/stock/stockAdjustment";
import { customOmit } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { StockAdjustmentDetails } from "@prisma/client";

export const toStockAdjustmentDTO = async (input: StockAdjustmentResponse): Promise<StockAdjustmentDTO> => {
  const omittedInput = customOmit<
    StockAdjustmentResponse,
    | "ccId"
    | "targetCcId"
    | "isActive"
    | "updatedBy"
    | "updatedAt"
    | "deletedBy"
    | "deletedAt"
    | "stockAdjustmentDetails"
  >(input, [
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
    input.stockAdjustmentDetails.map(async (detail) => {
      const omittedDetail = customOmit<
        StockAdjustmentDetails,
        "itemId" | "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "createdAt" | "updatedAt" | "deletedAt"
      >(detail, ["itemId", "isActive", "createdBy", "updatedBy", "deletedBy", "createdAt", "updatedAt", "deletedAt"]);
      const item = await itemMasterService.getItemMasterByIdWoDto(detail.itemId, true);

      return {
        ...omittedDetail.rest,
        item,
      };
    })
  );

  return {
    ...omittedInput.rest,
    collectionCenter: toIdValue(input.cc, "colName"),
    targetCollectionCenter: toIdValue(input.targetCc, "colName"),
    stockAdjustmentDetails: detailDTO,
  };
};
