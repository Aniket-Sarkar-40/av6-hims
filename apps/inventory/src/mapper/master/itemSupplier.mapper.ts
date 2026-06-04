import { commonService } from "@/services/common.service.js";
import {
  ItemSupplierDTO,
  ItemSupplierResponse,
} from "@/types/master/itemSupplier.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toItemSupplierDTO = async (
  data: ItemSupplierResponse[]
): Promise<ItemSupplierDTO[]> => {
  const allTaxDetails = await commonService.getAllElements<"TaxDetails">({
    cacheCode: "TAX_DETAILS",
    canNullReturnable: true,
    modelName: "TaxDetails",
    shortCode: "TAX_DETAILS",
    useActiveFlag: true,
  });

  return data.map((itemSupplier) => {
    const omittedItemSupplier = customOmit<
      ItemSupplierResponse,
      BaseModelAttrWoCancel | "taxDetailsId"
    >(itemSupplier, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "taxDetailsId",
    ]);

    const taxDetails =
      allTaxDetails.find((tax) => tax.id === itemSupplier.taxDetailsId) ?? null;
    return {
      ...omittedItemSupplier.rest,
      taxDetails: toIdValue(taxDetails, "name"),
    };
  });
};
