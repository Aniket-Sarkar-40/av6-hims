import { getBranchItemDetailsFromDb } from "@/repository/purchase/branchRequisition.repository.js";
import { getItemStockQtyByLocation } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  BranchRequisitionReturnDetailDTO,
  BranchRequisitionReturnDTO,
  BrReturnDetailDTO,
  GetBranchRequisitionReturnResponse,
} from "@/types/purchase/branchRequisitionReturn.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import {
  BranchRequisitionReturn,
  BranchReturnItemDetails,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBranchRequisitionReturnDTO = async (
  branchRequisitionReturn: GetBranchRequisitionReturnResponse
): Promise<BranchRequisitionReturnDTO> => {
  logger.info("entering::toBranchRequisitionReturnDTO::mapper");

  const branch = branchRequisitionReturn.branchId
    ? await branchService.getBranchById(branchRequisitionReturn.branchId, true)
    : null;

  const warehouse = branchRequisitionReturn.ccId
    ? await warehouseService.getWarehouseById(
        branchRequisitionReturn.ccId,
        true
      )
    : null;

  const reqFrom = branchRequisitionReturn.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        branchRequisitionReturn.requisitionFrom
      )
    : null;

  const approvedBy = branchRequisitionReturn.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        branchRequisitionReturn.approvedBy
      )
    : null;

  const rejectBy = branchRequisitionReturn.rejectBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        branchRequisitionReturn.rejectBy
      )
    : null;

  const acknowledgementBy = branchRequisitionReturn.acknowledgementBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        branchRequisitionReturn.acknowledgementBy
      )
    : null;

  const detailDTO: BranchRequisitionReturnDetailDTO[] = await Promise.all(
    branchRequisitionReturn.branchRequisitionReturnDetails.flatMap((detail) =>
      detail.branchReturnItemDetails.map(async (itemDetail) => {
        const itemDTO = detail.itemId
          ? await itemMasterService.getItemMasterById(
              { itemId: detail.itemId },
              true
            )
          : null;

        const branchInHandStock = branchRequisitionReturn.branchId
          ? await getItemStockQtyByLocation(
              detail.itemId,
              branchRequisitionReturn.branchId
            )
          : null;

        const warehouseInHandStock = branchRequisitionReturn.ccId
          ? await getItemStockQtyByLocation(
              detail.itemId,
              branchRequisitionReturn.ccId
            )
          : null;

        const branchItem = itemDetail.branchItemDetailsId
          ? await getBranchItemDetailsFromDb(itemDetail.branchItemDetailsId)
          : null;

        const detailCreatedBy = itemDetail.createdBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(
              itemDetail.createdBy
            )
          : null;
        const detailUpdatedBy = itemDetail.updatedBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(
              itemDetail.updatedBy
            )
          : null;

        return {
          ...itemDetail,

          item: itemDTO ? await itemMasterToDto(itemDTO) : null,

          branchRequisitionReturnDetailsId: detail.id,
          branchRequisitionDetailsId: detail.branchRequisitionDetailsId,

          reqAcknowledgedQty: branchItem?.acknowledgedQty ?? null,
          alreadyReturnedQty: branchItem?.returnedQty ?? null,

          totalRequestedReturnQty: detail.requestedReturnQty,
          totalAcknowledgedReturnQty: detail.acknowledgedReturnQty,

          branchInHandStock,
          warehouseInHandStock,

          createdBy: detailCreatedBy,
          updatedBy: detailUpdatedBy,
        };
      })
    )
  );

  const omittedBRR = customOmit<
    BranchRequisitionReturn,
    | "requisitionFrom"
    | "ccId"
    | "branchId"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  >(branchRequisitionReturn, [
    "requisitionFrom",
    "ccId",
    "branchId",
    "approvedBy",
    "rejectBy",
    "acknowledgementBy",
  ]);

  logger.info("exiting::toBranchRequisitionReturnDTO::mapper");

  return {
    ...omittedBRR.rest,

    requisitionFrom: toIdValue(reqFrom, "name"),
    warehouse: toIdValue(warehouse, "name"),
    branch: toIdValue(branch, "name"),

    approvedBy,
    rejectBy,
    acknowledgementBy,

    branchRequisitionReturnDetails: detailDTO,
  };
};

export const toBranchReturnDetailDTO = async (
  branchRequisitionReturns: GetBranchRequisitionReturnResponse[]
): Promise<BranchRequisitionReturnDetailDTO[]> => {
  return await Promise.all(
    branchRequisitionReturns.flatMap((branchRequisitionReturn) =>
      branchRequisitionReturn.branchRequisitionReturnDetails.flatMap((detail) =>
        detail.branchReturnItemDetails.map(async (itemDetail) => {
          const itemDTO = detail.itemId
            ? await itemMasterService.getItemMasterById(
                { itemId: detail.itemId },
                true
              )
            : null;

          const branchInHandStock = branchRequisitionReturn.branchId
            ? await getItemStockQtyByLocation(
                detail.itemId,
                branchRequisitionReturn.branchId
              )
            : null;

          const warehouseInHandStock = branchRequisitionReturn.ccId
            ? await getItemStockQtyByLocation(
                detail.itemId,
                branchRequisitionReturn.ccId
              )
            : null;

          const branchItem = itemDetail.branchItemDetailsId
            ? await getBranchItemDetailsFromDb(itemDetail.branchItemDetailsId)
            : null;

          const createdBy = itemDetail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                itemDetail.createdBy
              )
            : null;
          const updatedBy = itemDetail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                itemDetail.updatedBy
              )
            : null;

          return {
            ...itemDetail,

            item: itemDTO ? await itemMasterToDto(itemDTO) : null,

            createdBy,
            updatedBy,

            branchRequisitionReturnDetailsId: detail.id,
            branchRequisitionDetailsId: detail.branchRequisitionDetailsId,

            reqAcknowledgedQty: branchItem?.acknowledgedQty ?? null,
            alreadyReturnedQty: branchItem?.returnedQty ?? null,

            totalRequestedReturnQty: detail.requestedReturnQty,
            totalAcknowledgedReturnQty: detail.acknowledgedReturnQty,

            branchInHandStock,
            warehouseInHandStock,
          };
        })
      )
    )
  );
};
