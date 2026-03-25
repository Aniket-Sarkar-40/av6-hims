import { coreRequests } from "@/client/core/request";
import { requestStorage } from "@/config/requestContext";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository";
import { branchService } from "@/services/master/branch.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import { warehouseService } from "@/services/master/warehouse.service";
import { GrnDetailDTO, GrnDTO, GrnResponse } from "@/types/grn/grn";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { omitAudit, toIdValue } from "@/utils/idValue.utils";

export const toGrnDTO = async (grn: GrnResponse): Promise<GrnDTO> => {
  const supplierDTO = await itemSupplierService.getItemSupplierById(grn.supplierId, true);

  const ccSettingsId = requestStorage.getStore()?.settings?.warehouseMode;
  let warehouseDTO, branchDTO;

  if (ccSettingsId) {
    warehouseDTO = await warehouseService.getWarehouseById(grn.ccId, true);
  } else {
    branchDTO = await branchService.getBranchById(grn.ccId, true);
  }

  const createdBy = grn.createdBy ? await coreRequests.getEmployeeCache(grn.createdBy) : null;

  const detailDTO: GrnDetailDTO[] = await Promise.all(
    grn.goodReceiveDetails.map(async (detail) => {
      const item = await itemMasterService.getItemMasterById({ itemId: detail.itemId }, true);
      const inHandQty =
        (await getItemStockQtyByBatchWise({
          itemId: detail.itemId,
          ccId: grn.ccId,
          batchNo: detail.batchNo ?? null,
          expiryDate: detail.expiryDate ?? null,
        })) || null;

      return {
        ...detail,
        item: item ? await itemMasterToDto(item) : null,
        inHandQty: inHandQty ?? 0,
      };
    })
  );

  return {
    ...grn,
    supplier: toIdValue(supplierDTO, "name"),
    warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
    branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
    createdBy: createdBy,
    goodReceiveDetails: omitAudit(detailDTO),
  };
};
