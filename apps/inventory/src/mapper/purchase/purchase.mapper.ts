import { coreRequests } from "@/client/core/request";
import { requestStorage } from "@/config/requestContext";
import { branchService } from "@/services/master/branch.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemStoreService } from "@/services/master/itemStore.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import { warehouseService } from "@/services/master/warehouse.service";
import { PurchaseOrderDetailDTO, PurchaseOrderDTO } from "@/types/purchase/purchase";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { omitAudit, toIdValue } from "@/utils/idValue.utils";
import { PurchaseOrder, PurchaseOrderDetails } from "@prisma/client";

export const toPurchaseOrderDTO = async (
  purchaseOrder: PurchaseOrder & {
    purchaseOrderDetails: PurchaseOrderDetails[];
  }
): Promise<PurchaseOrderDTO> => {
  const supplierDTO = purchaseOrder.supplierId
    ? await itemSupplierService.getItemSupplierById(purchaseOrder.supplierId, true)
    : null;
  const storeDTO = purchaseOrder.storeId ? await itemStoreService.getItemStoreById(purchaseOrder.storeId, true) : null;
  let warehouse, branch;
  const warehouseMode = requestStorage.getStore()?.settings?.warehouseMode;
  if (warehouseMode && purchaseOrder.ccId) {
    warehouse = await warehouseService.getWarehouseById(purchaseOrder.ccId, true);
  } else if (!warehouseMode && purchaseOrder.ccId) {
    branch = await branchService.getBranchById(purchaseOrder.ccId, true);
  }

  const createdBy = purchaseOrder.createdBy ? await coreRequests.getEmployeeCache(purchaseOrder.createdBy) : null;
  const updatedBy = purchaseOrder.updatedBy ? await coreRequests.getEmployeeCache(purchaseOrder.updatedBy) : null;

  const detailDTO: PurchaseOrderDetailDTO[] = await Promise.all(
    purchaseOrder.purchaseOrderDetails.map(async (detail) => {
      const itemDTO = detail.itemId ? await itemMasterService.getItemMasterById({ itemId: detail.itemId }, true) : null;
      const createdBy = detail.createdBy ? await coreRequests.getEmployeeCache(detail.createdBy) : null;
      const updatedBy = detail.updatedBy ? await coreRequests.getEmployeeCache(detail.updatedBy) : null;

      return {
        ...detail,
        item: itemDTO ? await itemMasterToDto(itemDTO) : null,
        createdBy: createdBy,
        updatedBy: updatedBy,
      };
    })
  );

  return {
    ...purchaseOrder,
    store: toIdValue(storeDTO, "itemStoreName"),
    supplier: toIdValue(supplierDTO, "name"),
    warehouse: toIdValue(warehouse, "name"),
    branch: toIdValue(branch, "name"),
    createdBy: omitAudit(createdBy),
    updatedBy: omitAudit(updatedBy),
    purchaseOrderDetails: omitAudit(detailDTO),
  };
};
