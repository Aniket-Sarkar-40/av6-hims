import { coreRequests } from "@/client/core/request";
import { requestStorage } from "@/config/requestContext";
import { getItemStockQtyByLocation, getItemStockQtyByUser } from "@/repository/stock/stock.repository";
import { branchService } from "@/services/master/branch.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { warehouseService } from "@/services/master/warehouse.service";
import {
  RequisitionItemDetailDTO,
  RequisitionItemDetailResponse,
  StoreReqBatchWiseResponse,
  StoreRequisitionBatchWiseDTO,
  StoreRequisitionDetailDTO,
  StoreRequisitionDetailDTOBranch,
  StoreRequisitionDTO,
  StoreRequisitionResponse,
} from "@/types/purchase/storeRequisition";
import { RawItemStock } from "@/types/stock/stock";
import { itemMasterToDto } from "@/utils/commonResponse.utils";
import { toIdValue } from "@/utils/idValue.utils";
import { logger } from "@/utils/logger.utils";
import { ItemStock } from "@prisma/client";

export const toStoreRequisitionDTO = async (
  storeRequisition: StoreRequisitionResponse
): Promise<StoreRequisitionDTO> => {
  logger.info("entering::toStoreRequisitionDTO::mapper");
  let warehouse, branch;

  const warehouseMode = requestStorage.getStore()?.settings?.warehouseMode;

  if (warehouseMode && storeRequisition.ccId) {
    warehouse = await warehouseService.getWarehouseById(storeRequisition.ccId, true);
  } else if (!warehouseMode && storeRequisition.ccId) {
    branch = await branchService.getBranchById(storeRequisition.ccId, true);
  }
  const createdBy = storeRequisition.createdBy ? await coreRequests.getEmployeeCache(storeRequisition.createdBy) : null;
  const reqFrom = storeRequisition.requisitionFrom
    ? await coreRequests.getEmployeeCache(storeRequisition.requisitionFrom)
    : null;
  const updatedBy = storeRequisition.updatedBy ? await coreRequests.getEmployeeCache(storeRequisition.updatedBy) : null;
  const approvedBy = storeRequisition.approvedBy
    ? await coreRequests.getEmployeeCache(storeRequisition.approvedBy)
    : null;
  const rejectBy = storeRequisition.rejectBy ? await coreRequests.getEmployeeCache(storeRequisition.rejectBy) : null;

  const acknowledgementBy = storeRequisition.acknowledgementBy
    ? await coreRequests.getEmployeeCache(storeRequisition.acknowledgementBy)
    : null;

  const detailDTO: StoreRequisitionDetailDTOBranch[] = await Promise.all(
    storeRequisition.storeRequisitionDetails.map(async (detail) => {
      const itemDTO = detail.itemId ? await itemMasterService.getItemMasterById({ itemId: detail.itemId }, true) : null;

      const qtyAtCc = await getItemStockQtyByLocation(detail.itemId, storeRequisition.ccId);

      let inHandWarehouseQty: number | null = null;
      let inHandBranchQty: number | null = null;

      const warehouseRow = await warehouseService.getWarehouseById(storeRequisition.ccId, true);
      if (warehouseRow) {
        inHandWarehouseQty = qtyAtCc;
      } else {
        const branchRow = await branchService.getBranchById(storeRequisition.ccId, true);
        if (branchRow) inHandBranchQty = qtyAtCc;
      }

      let userInHandStock: number | null = null;
      if (storeRequisition.requisitionFrom) {
        userInHandStock = await getItemStockQtyByUser(detail.itemId, storeRequisition.requisitionFrom);
      }

      return {
        ...detail,
        warehouseInHandStock: inHandWarehouseQty,
        branchInHandStock: inHandBranchQty,
        userInHandStock: userInHandStock,
        item: itemDTO ? await itemMasterToDto(itemDTO) : null,
      };
    })
  );

  return {
    ...storeRequisition,
    warehouse: toIdValue(warehouse, "name"),
    branch: toIdValue(branch, "name"),
    storeRequisitionDetails: detailDTO,
    createdBy: createdBy,
    requisitionFrom: toIdValue(reqFrom, "name") ?? null,
    updatedBy: updatedBy,
    approvedBy: approvedBy,
    rejectBy: rejectBy,
    staff: reqFrom ?? null,
    acknowledgementBy: acknowledgementBy,
  };
};

export const toRequisitionItemDetailDTO = async (
  storeRequisition: RequisitionItemDetailResponse
): Promise<RequisitionItemDetailDTO> => {
  const itemDTO = storeRequisition.itemId
    ? await itemMasterService.getItemMasterById({ itemId: storeRequisition.itemId }, true)
    : null;

  const inHandBranchQty = storeRequisition.ackCCId
    ? await getItemStockQtyByLocation(storeRequisition.itemId, storeRequisition.ackCCId)
    : null;
  const inHandWarehouseQty = await getItemStockQtyByLocation(storeRequisition.itemId, storeRequisition.ccId);

  const detailDTO: StoreRequisitionDetailDTO = {
    ...storeRequisition.storeRequisitionDetails,
    item: itemDTO ? await itemMasterToDto(itemDTO) : null,
    warehouseInHandStock: inHandWarehouseQty,
    branchInHandStock: inHandBranchQty,
  };

  return {
    ...storeRequisition,
    storeRequisitionDetails: detailDTO,
  };
};

export const toStoreRequisitionBatchWiseDTO = async (
  storeRequisition: StoreReqBatchWiseResponse
): Promise<StoreRequisitionBatchWiseDTO> => {
  let warehouse, branch;

  const warehouseMode = requestStorage.getStore()?.settings?.warehouseMode;

  if (warehouseMode && storeRequisition.ccId) {
    warehouse = await warehouseService.getWarehouseById(storeRequisition.ccId, true);
  } else {
    branch = await branchService.getBranchById(storeRequisition.ccId, true);
  }
  const reqFrom = await coreRequests.getEmployeeCache(storeRequisition.requisitionFrom);
  const detailDTO: RequisitionItemDetailDTO[] = await Promise.all(
    storeRequisition.requisitionItemDetails.map(async (detail) => await toRequisitionItemDetailDTO(detail))
  );

  return {
    ...storeRequisition,
    requisitionFrom: toIdValue(reqFrom, "name"),
    warehouse: toIdValue(warehouse, "name"),
    branch: toIdValue(branch, "name"),
    requisitionItemDetails: detailDTO,
  };
};

export const toStockEntity = (raw: RawItemStock): ItemStock => {
  return {
    id: raw.id,
    itemId: raw.item_id,
    ccId: raw.cc_id,
    userId: raw.user_id,
    quantity: raw.quantity,
    batchNo: raw.batch_no ?? null,
    expiryDate: raw.expiry_date ? new Date(raw.expiry_date) : null,
    isActive: Boolean(raw.is_active),
    createdBy: raw.created_by ?? null,
    updatedBy: raw.updated_by ?? null,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
    deletedBy: raw.deleted_by ?? null,
    deletedAt: raw.deleted_at ? new Date(raw.deleted_at) : null,
    isFoc: Boolean(raw.is_foc),
  };
};
