import { getPendingBRRFromBRId } from "@/repository/purchase/branchRequisitionReturn.repository.js";
import {
  getItemStockQtyByLocation,
  getItemStockQtyByUser,
} from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  RequisitionItemDetailDTO,
  RequisitionItemDetailResponse,
  StoreReqBatchWiseResponse,
  StoreRequisitionBatchWiseDTO,
  StoreRequisitionDetailDTO,
  StoreRequisitionDetailDTOBranch,
  StoreRequisitionDTO,
  StoreRequisitionResponse,
} from "@/types/purchase/storeRequisition.js";
import {
  ItemStockWithQtyBreakdown,
  RawItemStock,
} from "@/types/stock/stock.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { InvItemStock } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";

export const toStoreRequisitionDTO = async (
  storeRequisition: StoreRequisitionResponse[]
): Promise<StoreRequisitionDTO[]> => {
  logger.info("entering::toStoreRequisitionDTO::mapper");
  return Promise.all(
    storeRequisition.map(async (requisition) => {
      const omittedRequisition = customOmit<
        StoreRequisitionResponse,
        BaseModelAttrWoCancel | "ccId"
      >(requisition, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
      ]);

      const pendingBRR = await getPendingBRRFromBRId(requisition.id);
      const isAnyPendingReturn = pendingBRR.length > 0;

      const branch = await branchService.getBranchById(requisition.ccId, true);

      const createdBy = requisition.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.createdBy,
            true
          )
        : null;
      const reqFrom = requisition.requisitionFrom
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.requisitionFrom,
            true
          )
        : null;
      const updatedBy = requisition.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.updatedBy,
            true
          )
        : null;
      const approvedBy = requisition.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.approvedBy,
            true
          )
        : null;
      const rejectBy = requisition.rejectBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.rejectBy,
            true
          )
        : null;

      const acknowledgementBy = requisition.acknowledgementBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.acknowledgementBy,
            true
          )
        : null;

      const detailDTO: StoreRequisitionDetailDTOBranch[] = await Promise.all(
        requisition.storeRequisitionDetails.map(async (detail) => {
          const itemDTO = detail.itemId
            ? await itemMasterService.getItemMasterById(
                { itemId: detail.itemId },
                true
              )
            : null;

          const qtyAtCc = await getItemStockQtyByLocation(
            detail.itemId,
            requisition.ccId
          );
          let inHandWarehouseQty: number | null = null;
          let inHandBranchQty: number | null = null;

          const warehouseRow = await warehouseService.getWarehouseById(
            requisition.ccId,
            true
          );
          if (warehouseRow) {
            inHandWarehouseQty = qtyAtCc;
          } else {
            const branchRow = await branchService.getBranchById(
              requisition.ccId,
              true
            );
            if (branchRow) inHandBranchQty = qtyAtCc;
          }

          let userInHandStock: number | null = null;
          if (requisition.requisitionFrom) {
            userInHandStock = await getItemStockQtyByUser(
              detail.itemId,
              requisition.requisitionFrom
            );
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
        ...omittedRequisition.rest,
        branch: toIdValue(branch, "name"),
        storeRequisitionDetails: detailDTO,
        createdBy: createdBy,
        requisitionFrom: toIdValue(reqFrom, "name") ?? null,
        updatedBy: updatedBy,
        approvedBy: approvedBy,
        rejectBy: rejectBy,
        staff: reqFrom ?? null,
        acknowledgementBy: acknowledgementBy,
        isAnyPendingReturn,
      };
    })
  );
};

export const toRequisitionItemDetailDTO = async (
  storeRequisition: RequisitionItemDetailResponse
): Promise<RequisitionItemDetailDTO> => {
  const itemDTO = storeRequisition.itemId
    ? await itemMasterService.getItemMasterById(
        { itemId: storeRequisition.itemId },
        true
      )
    : null;

  const inHandBranchQty = storeRequisition.ackCCId
    ? await getItemStockQtyByLocation(
        storeRequisition.itemId,
        storeRequisition.ackCCId
      )
    : null;
  const inHandWarehouseQty = await getItemStockQtyByLocation(
    storeRequisition.itemId,
    storeRequisition.ccId
  );

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
  const branch = await branchService.getBranchById(storeRequisition.ccId, true);

  const reqFrom = storeRequisition.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.requisitionFrom,
        true
      )
    : null;
  const detailDTO: RequisitionItemDetailDTO[] = await Promise.all(
    storeRequisition.requisitionInvItemDetails.map(
      async (detail) => await toRequisitionItemDetailDTO(detail)
    )
  );

  return {
    ...storeRequisition,
    requisitionFrom: toIdValue(reqFrom, "name"),
    branch: toIdValue(branch, "name"),
    requisitionItemDetails: detailDTO,
  };
};

export const toStockEntity = (raw: RawItemStock): ItemStockWithQtyBreakdown => {
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

    normalQty:
      raw.normal_qty !== undefined && raw.normal_qty !== null
        ? Number(raw.normal_qty)
        : undefined,
    focQty:
      raw.foc_qty !== undefined && raw.foc_qty !== null
        ? Number(raw.foc_qty)
        : undefined,
    totalQty:
      raw.total_qty !== undefined && raw.total_qty !== null
        ? Number(raw.total_qty)
        : undefined,
  };
};
