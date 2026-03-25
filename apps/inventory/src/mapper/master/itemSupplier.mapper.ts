import { taxDetailsService } from "@/services/master/taxDetails.service";
import { ItemSupplierDTO, ItemSupplierResponse } from "@/types/master/itemSupplier";
import { getAllBranchAndWarehouse, getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { toIdValue } from "../../utils/idValue.utils";
import { customOmit } from "@/utils/helper.utils";

export const toItemSupplierDTO = async (itemSupplier: ItemSupplierResponse): Promise<ItemSupplierDTO> => {
  const omittedItemSupplier = customOmit<
    ItemSupplierResponse,
    "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(itemSupplier, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);

  const cc = await getBranchOrWarehouse(itemSupplier.branchDetailsId);
  const taxDetails = itemSupplier.taxDetailsId
    ? await taxDetailsService.getTaxDetailsById(itemSupplier.taxDetailsId, true)
    : null;
  return {
    ...omittedItemSupplier.rest,
    taxDetails: toIdValue(taxDetails, "name"),
    collectionCenter: toIdValue(cc, "name"),
  };
};

export const toAllItemSupplierDTO = async (itemSupplier: ItemSupplierResponse[]): Promise<ItemSupplierDTO[]> => {
  const collectionCenters = await getAllBranchAndWarehouse();
  const taxDetails = await taxDetailsService.getAllTaxDetails(true);

  const itemStoreDTOs = await Promise.all(
    itemSupplier.map(async (item) => {
      const omittedItemSupplier = customOmit<
        ItemSupplierResponse,
        "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
      >(item, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);
      const cc = collectionCenters.find((center) => center.id === item.branchDetailsId);
      const tax = taxDetails.find((t) => t.id === item.taxDetailsId);
      return {
        ...omittedItemSupplier.rest,
        taxDetails: tax ? toIdValue(tax, "name") : null,
        collectionCenter: cc ? toIdValue(cc, "name") : null,
      };
    })
  );

  return itemStoreDTOs;
};
