import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import {
  ItemSupplierMapDTO,
  ItemSupplierMapExcelRow,
  ItemSupplierMapImportExcelInput,
  ItemSupplierMapImportExcelReq,
} from "@/types/itemSupplierMap/itemSupplierMap.js";
import { getAllBranchAndWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { customOmit } from "av6-utils";
import { toIdValue } from "av6-utils";
import {
  InvItemSupplierMapping,
  Prisma,
} from "@repo/db/generated/prisma/client";

export function mapRowToItemSupplierMapImportExcelInput(
  row: ItemSupplierMapExcelRow,
  rowNo: number
): Prisma.InvItemSupplierMapExcelCreateInput {
  const mappedData: Prisma.InvItemSupplierMapExcelCreateInput = {
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

export const toItemSupplierMapDTO = async (
  data: InvItemSupplierMapping[]
): Promise<ItemSupplierMapDTO[]> => {
  const items = await itemMasterService.getAllItemMaster(true);
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const collectionCenters = await getAllBranchAndWarehouse();

  return Promise.all(
    data.map(async (itemSupplierMap) => {
      const omittedItemSupplierMap = customOmit<
        InvItemSupplierMapping,
        BaseModelAttrWoCancel | "ccId" | "itemId" | "supplierId"
      >(itemSupplierMap, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
        "itemId",
        "supplierId",
      ]);

      const item = items.find((i) => i.id === itemSupplierMap.itemId) ?? null;
      const supplier =
        suppliers.find((s) => s.id === itemSupplierMap.supplierId) ?? null;
      const CollectionCenter =
        collectionCenters.find((cc) => cc.id === itemSupplierMap.ccId) ?? null;
      return {
        ...omittedItemSupplierMap.rest,
        item: item ? toIdValue(item, "item") : null,
        supplier: supplier ? toIdValue(supplier, "name") : null,
        collectionCenter: toIdValue(CollectionCenter, "name"),
      };
    })
  );
};
