import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import {
  ItemSuppierMapDTO,
  ItemSupplierMapExcelRow,
  ItemSupplierMapImportExcelInput,
  ItemSupplierMapImportExcelReq,
} from "@/types/itemSupplierMap/itemSupplierMap";
import { getAllBranchAndWarehouse, getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { customOmit } from "@/utils/helper.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { ItemSupplierMapping, Prisma } from "@prisma/client";

export function mapRowToItemSupplierMapImportExcelInput(
  row: ItemSupplierMapExcelRow,
  rowNo: number
): Prisma.ItemSupplierMapExcelCreateInput {
  const mappedData: Prisma.ItemSupplierMapExcelCreateInput = {
    rowNo,
    itemCode: row["Item Code"],
    itemId: row["Item Id"],
    itemCategory: row["Item Category"],
    itemName: row["Item Name"],
    basePrice: row["Base Price"],
    supplierPrice: row["Supplier Price"],
  };
  return mappedData;
}

export function toItemSupplierMapImportExcelEntity(
  req: ItemSupplierMapImportExcelReq
): ItemSupplierMapImportExcelInput {
  return {
    ccId: Number(req.ccId),
    supplierId: Number(req.supplierId),
  };
}

export const toItemSupplierMapDTO = async (input: ItemSupplierMapping): Promise<ItemSuppierMapDTO> => {
  const item = await itemMasterService.getItemMasterById({ itemId: input.itemId }, true);
  const supplier = await itemSupplierService.getItemSupplierById(input.supplierId, true);
  const cc = await getBranchOrWarehouse(input.ccId);
  const omittedItemSupplierMap = customOmit<
    ItemSupplierMapping,
    "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
  >(input, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);

  return {
    ...omittedItemSupplierMap.rest,
    item: item ? toIdValue(item, "item") : null,
    supplier: toIdValue(supplier, "name"),
    collectionCenter: cc ? toIdValue(cc, "name") : null,
  };
};

export const toAllItemSupplierMapDTO = async (input: ItemSupplierMapping[]): Promise<ItemSuppierMapDTO[]> => {
  const items = await itemMasterService.getAllItemMaster();
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const collectionCenters = await getAllBranchAndWarehouse();

  const itemSupplierMapDTO = await Promise.all(
    input.map(async (d) => {
      const supplier = suppliers.find((s) => s.id === d.supplierId);
      const cc = collectionCenters.find((center) => center.id === d.ccId);
      const item = items.find((i) => i.id === d.itemId);
      const omittedItemSupplierMap = customOmit<
        ItemSupplierMapping,
        "createdBy" | "updatedBy" | "isActive" | "deletedAt" | "deletedBy" | "createdAt" | "updatedAt"
      >(d, ["createdAt", "updatedBy", "isActive", "deletedAt", "deletedBy", "createdAt", "updatedAt"]);

      return {
        ...omittedItemSupplierMap.rest,
        item: item ? toIdValue(item, "item") : null,
        supplier: supplier ? toIdValue(supplier, "name") : null,
        collectionCenter: cc ? toIdValue(cc, "name") : null,
      };
    })
  );

  return itemSupplierMapDTO;
};
