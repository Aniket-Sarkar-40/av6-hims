import { itemMasterToDto } from "@/mapper/master/itemMaster.mapper.js";
import { getItemStockQtyByLocation } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  BranchItemDetailDTO,
  BranchItemDetailResponse,
  BranchReqBatchWiseResponse,
  BranchRequisitionBatchWiseDTO,
  BranchRequisitionDetailDTO,
  BranchRequisitionDTO,
  BranchRequisitionResponse,
} from "@/types/purchase/branchRequisition.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBranchRequisitionDTO = async (
  branchRequisition: BranchRequisitionResponse[]
): Promise<BranchRequisitionDTO[]> => {
  logger.info("entering::toBranchRequisitionDTO::mapper");

  const dto = await Promise.all(
    branchRequisition.map(async (requisition) => {
      const omittedRequisition = customOmit<
        BranchRequisitionResponse,
        BaseModelAttrWoCancel | "ccId" | "branchId" | "requisitionFrom"
      >(requisition, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "ccId",
        "branchId",
        "requisitionFrom",
      ]);

      const warehouse = requisition.ccId
        ? await warehouseService.getWarehouseById(requisition.ccId, true)
        : null;

      const branch = requisition.branchId
        ? await branchService.getBranchById(requisition.branchId, true)
        : null;

      const requisitionFrom = requisition.requisitionFrom
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.requisitionFrom
          )
        : null;

      const createdBy = requisition.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.createdBy
          )
        : null;

      const updatedBy = requisition.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.updatedBy
          )
        : null;

      const approvedBy = requisition.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.approvedBy
          )
        : null;

      const rejectBy = requisition.rejectBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.rejectBy
          )
        : null;

      const acknowledgementBy = requisition.acknowledgementBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisition.acknowledgementBy
          )
        : null;

      const detailDTO: BranchRequisitionDetailDTO[] = await Promise.all(
        requisition.branchRequisitionDetails.map(async (detail) => {
          const itemDTO = detail.itemId
            ? await itemMasterService.getItemMasterById(
                { itemId: detail.itemId },
                true
              )
            : null;

          const warehouseInHandStock = requisition.ccId
            ? await getItemStockQtyByLocation(detail.itemId, requisition.ccId)
            : null;

          const branchInHandStock = requisition.branchId
            ? await getItemStockQtyByLocation(
                detail.itemId,
                requisition.branchId
              )
            : null;

          return {
            ...detail,
            warehouseInHandStock,
            branchInHandStock,
            item: itemDTO ? await itemMasterToDto(itemDTO) : null,
          };
        })
      );

      return {
        ...omittedRequisition.rest,
        warehouse: toIdValue(warehouse, "name"),
        branch: toIdValue(branch, "name"),
        requisitionFrom,
        branchRequisitionDetails: detailDTO,
        createdBy,
        updatedBy,
        approvedBy,
        rejectBy,
        acknowledgementBy,
      };
    })
  );

  logger.info("exiting::toBranchRequisitionDTO::mapper");
  return dto;
};

export const toBranchItemDetailDTO = async (
  branchRequisition: BranchItemDetailResponse,
  branchId?: number | null
): Promise<BranchItemDetailDTO> => {
  const itemDTO = branchRequisition.itemId
    ? await itemMasterService.getItemMasterById(
        { itemId: branchRequisition.itemId },
        true
      )
    : null;

  const inHandWarehouseQty = branchRequisition.ccId
    ? await getItemStockQtyByLocation(
        branchRequisition.itemId,
        branchRequisition.ccId
      )
    : null;

  const branchStockLocationId = branchRequisition.ackCCId ?? branchId ?? null;

  const inHandBranchQty = branchStockLocationId
    ? await getItemStockQtyByLocation(
        branchRequisition.itemId,
        branchStockLocationId
      )
    : null;

  const detailDTO: BranchRequisitionDetailDTO = {
    ...branchRequisition.branchRequisitionDetails,
    item: itemDTO ? await itemMasterToDto(itemDTO) : null,
    warehouseInHandStock: inHandWarehouseQty,
    branchInHandStock: inHandBranchQty,
  };

  return {
    ...branchRequisition,
    branchRequisitionDetails: detailDTO,
  };
};

export const toBranchRequisitionBatchWiseDTO = async (
  branchRequisition: BranchReqBatchWiseResponse
): Promise<BranchRequisitionBatchWiseDTO> => {
  const omittedBranchReq = customOmit<
    BranchReqBatchWiseResponse,
    | BaseModelAttrWoCancel
    | "ccId"
    | "branchId"
    | "requisitionFrom"
    | "branchItemDetails"
  >(branchRequisition, [
    "createdBy",
    "updatedBy",
    "deletedBy",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "ccId",
    "branchId",
    "requisitionFrom",
    "branchItemDetails",
  ]);

  const warehouse = branchRequisition.ccId
    ? await warehouseService.getWarehouseById(branchRequisition.ccId, true)
    : null;

  const branch = branchRequisition.branchId
    ? await branchService.getBranchById(branchRequisition.branchId, true)
    : null;

  const reqFrom = branchRequisition.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        branchRequisition.requisitionFrom
      )
    : null;

  const detailDTO: BranchItemDetailDTO[] = await Promise.all(
    branchRequisition.branchItemDetails.map(
      async (detail) =>
        await toBranchItemDetailDTO(detail, branchRequisition.branchId)
    )
  );

  return {
    ...omittedBranchReq.rest,
    requisitionFrom: toIdValue(reqFrom, "name"),
    warehouse: toIdValue(warehouse, "name"),
    branch: toIdValue(branch, "name"),
    branchItemDetails: detailDTO,
  };
};
