import { requestStorage } from "@repo/platform/config/requestContext.js";
import { itemService } from "@/services/item/item.service.js";
import {
  BranchItemMapExcelRow,
  BranchWithSellAmountMap,
  ItemWiseItemBranchMapDTO,
  ItemWiseMappedBranch,
} from "@/types/item/itemBranchMap.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { RoundFormat } from "@repo/db/generated/prisma/enums.js";
import { applyRound } from "@/utils/commonCalculation.utils.js";
import { settingsService } from "@/services/master/settings.service.js";

export const toItemBranchMapDetailDTO = async (
  itemId: number,
  branchMaps: BranchWithSellAmountMap[],
): Promise<ItemWiseItemBranchMapDTO> => {
  const item = await itemService.getItemByIdWoDTO(itemId, true);

  const branches: ItemWiseMappedBranch[] = branchMaps.map((branchMap) => {
    return {
      ...branchMap,
      branchSellAmountMap: branchMap.branchSellAmountMap?.[0] || null,
    };
  });

  return {
    item,
    branches,
  };
};

export async function mapRowToBranchItemMapExcelCreateInput(
  row: BranchItemMapExcelRow,
  rowNo: number,
): Promise<Omit<Prisma.PmsBranchItemMapExcelCreateInput, "batchJob">> {
  const settings = await settingsService.getSettings(true);
  const precision = settings?.itemPrecision ?? settings?.defaultPrecision ?? 2;
  const mappedData: Omit<Prisma.PmsBranchItemMapExcelCreateInput, "batchJob"> =
    {
      rowNo,
      branchId: row["Branch ID"],
      branchName: row["Branch Name"],
      itemId: row["Item ID"],
      itemNumber: row["Item Number"],
      itemName: row["Item Name"],
      itemCategory: row["Item Category"] || "",
      defaultDiscount: row["Default Discount"],
      defaultB2BDiscount: row["Default B2B Discount"],
      tax: row["Tax"],
      taxMethod: row["Tax Method"],
      purchaseAmount: applyRound(
        row["Purchase Amount"],
        RoundFormat.TO_FIXED,
        precision,
      ),
      saleAmount: applyRound(
        row["Sale Amount"],
        RoundFormat.TO_FIXED,
        precision,
      ),
      insurancePercentage: row["Insurance Percentage"],
      walkInPercentage: row["Walk In Percentage"],
    };
  return mappedData;
}
