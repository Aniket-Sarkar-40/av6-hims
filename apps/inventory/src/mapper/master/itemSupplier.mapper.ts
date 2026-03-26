import {
  ItemSupplierDTO,
  ItemSupplierResponse,
} from "@/types/master/itemSupplier.js";
import { getAllBranchAndWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { customOmit, toIdValue } from "av6-utils";
import { commonService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export const toItemSupplierDTO = async (
  data: ItemSupplierResponse[],
): Promise<ItemSupplierDTO[]> => {
  const allTaxDetails = await commonService.getAllElements<"TaxDetails">({
    cacheCode: "TAX_DETAILS",
    canNullReturnable: true,
    modelName: "TaxDetails",
    shortCode: "TAX_DETAILS",
    useActiveFlag: true,
  });

  const CollectionCenters = await getAllBranchAndWarehouse();

  return data.map((itemSupplier) => {
    const omittedItemSupplier = customOmit<
      ItemSupplierResponse,
      BaseModelAttrWoCancel | "branchDetailsId" | "taxDetailsId"
    >(itemSupplier, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "branchDetailsId",
      "taxDetailsId",
    ]);

    const CollectionCenter =
      CollectionCenters.find((cc) => cc.id === itemSupplier.branchDetailsId) ??
      null;
    const taxDetails =
      allTaxDetails.find((tax) => tax.id === itemSupplier.taxDetailsId) ?? null;
    return {
      ...omittedItemSupplier.rest,
      taxDetails: toIdValue(taxDetails, "name"),
      collectionCenter: toIdValue(CollectionCenter, "name"),
    };
  });
};
