import { coreRequests } from "@/client/core/request";
import { requestStorage } from "@/config/requestContext";
import { getGrnDetailsByIdFromDb } from "@/repository/grn/grn.repository";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository";
import { branchService } from "@/services/master/branch.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import { warehouseService } from "@/services/master/warehouse.service";
import { GoodReceiveReturnDetailDTO, GoodReceiveReturnDTO, GrnReturnResponse } from "@/types/grn/grnReturn";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { omitAudit, toIdValue } from "@/utils/idValue.utils";

export const toGrnReturnDTO = async (grnReturn: GrnReturnResponse): Promise<GoodReceiveReturnDTO> => {
  const itemSupplier = await itemSupplierService.getItemSupplierById(grnReturn.supplierId, true);

  const ccSettingsId = requestStorage.getStore()?.settings?.warehouseMode;
  let warehouseDTO, branchDTO;
  if (ccSettingsId) {
    warehouseDTO = await warehouseService.getWarehouseByIdWoDTO(grnReturn.ccId, true);
  } else {
    branchDTO = await branchService.getBranchByIdWoDTO(grnReturn.ccId, true);
  }

  const createdBy = grnReturn.createdBy ? await coreRequests.getEmployeeCache(grnReturn.createdBy) : null;
  const approvedBy = grnReturn.approvedBy ? await coreRequests.getEmployeeCache(grnReturn.approvedBy) : null;
  const rejectedBy = grnReturn.rejectedBy ? await coreRequests.getEmployeeCache(grnReturn.rejectedBy) : null;

  const detailDTO: GoodReceiveReturnDetailDTO[] = await Promise.all(
    grnReturn.goodReceiveReturnDetails.map(async (detail) => {
      const item = await itemMasterService.getItemMasterById({ itemId: detail.itemId }, true);
      const inHandQty =
        (await getItemStockQtyByBatchWise({
          itemId: detail.itemId,
          ccId: grnReturn.ccId,
          batchNo: detail.batchNo,
          expiryDate: detail.expiryDate,
        })) || null;

      const grnDetails = await getGrnDetailsByIdFromDb(detail.grnDetailId);

      return {
        ...detail,
        inHandQty: inHandQty ? inHandQty : 0,
        returnedQty: grnDetails?.returnQuantity ?? 0,
        purchasePrice: grnDetails?.purchasedPrice ?? 0,
        item: item ? await itemMasterToDto(item) : null,
      };
    })
  );

  return {
    ...grnReturn,
    goodReceiveReturnDetails: omitAudit(detailDTO),
    warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
    branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
    supplier: toIdValue(itemSupplier, "name"),
    createdBy: createdBy,
    approvedBy: approvedBy,
    rejectedBy: rejectedBy,
  };
};
