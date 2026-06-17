import { getRequisitionItemDetailsFromDb } from "@/repository/purchase/storeRequisition.repository.js";
import {
  getInTransitStockQtyByBatchWise,
  getItemStockQtyByBatchWise,
  getItemStockQtyByLocation,
  getItemStockQtyByUser,
} from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  GetStoreRequisitionReturnResponse,
  StoreRequisitionReturnDetailDTO,
  StoreRequisitionReturnDTO,
  StrReturnDetailDTO,
} from "@/types/purchase/storeRequisitionReturn.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import {
  StoreRequisitionReturn,
  StoreRequisitionReturnDetails,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit, toIdValue } from "av6-utils";

export const toStoreRequisitionReturnDTO = async (
  storeRequisitionReturn: GetStoreRequisitionReturnResponse
): Promise<StoreRequisitionReturnDTO> => {
  logger.info("entering::toStoreRequisitionReturnDTO::mapper");

  const branch = await branchService.getBranchById(
    storeRequisitionReturn.ccId,
    true
  );

  const reqFrom = storeRequisitionReturn.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.requisitionFrom
      )
    : null;

  const approvedBy = storeRequisitionReturn.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.approvedBy
      )
    : null;

  const rejectBy = storeRequisitionReturn.rejectBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.rejectBy
      )
    : null;

  const acknowledgementBy = storeRequisitionReturn.acknowledgementBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.acknowledgementBy
      )
    : null;

  const detailDTO: StoreRequisitionReturnDetailDTO[] = await Promise.all(
    storeRequisitionReturn.storeRequisitionReturnDetails.flatMap((detail) =>
      detail.requisitionReturnItemDetails.map(async (itemDetail) => {
        const itemDTO = detail.itemId
          ? await itemMasterService.getItemMasterById(
              { itemId: detail.itemId },
              true
            )
          : null;

        const branchInHandStock = await getItemStockQtyByLocation(
          detail.itemId,
          storeRequisitionReturn.ccId
        );

        const userInHandStock = storeRequisitionReturn.requisitionFrom
          ? await getItemStockQtyByUser(
              detail.itemId,
              storeRequisitionReturn.requisitionFrom
            )
          : null;

        const reqItem = itemDetail.requisitionItemDetailsId
          ? await getRequisitionItemDetailsFromDb(
              itemDetail.requisitionItemDetailsId
            )
          : null;

        const availableQtyToReturn = storeRequisitionReturn.requisitionFrom
          ? await getItemStockQtyByBatchWise({
              itemId: itemDetail.itemId,
              batchNo: itemDetail.batchNo ?? null,
              userId: storeRequisitionReturn.requisitionFrom,
              expiryDate: itemDetail.expiryDate
                ? new Date(itemDetail.expiryDate)
                : undefined,
              isFoc: itemDetail.isFoc,
            })
          : null;

        // This is used only for acknowledgement Store Requisition Return, so we need to get the in transit stock quantity for the item in the store to the warehouse
        const inTransitQtyToAcknowledge =
          storeRequisitionReturn.requisitionFrom && storeRequisitionReturn.ccId
            ? await getInTransitStockQtyByBatchWise({
                itemId: itemDetail.itemId,
                batchNo: itemDetail.batchNo ?? null,
                userId: storeRequisitionReturn.requisitionFrom,
                toCcId: storeRequisitionReturn.ccId,
                expiryDate: itemDetail.expiryDate
                  ? new Date(itemDetail.expiryDate)
                  : null,
                isFoc: itemDetail.isFoc,
              })
            : null;

        const detailCreatedBy = detail.createdBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.createdBy)
          : null;
        const detailUpdatedBy = detail.updatedBy
          ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.updatedBy)
          : null;

        return {
          ...itemDetail,

          item: itemDTO ? await itemMasterToDto(itemDTO) : null,

          storeRequisitionReturnDetailsId: detail.id,
          storeRequisitionDetailsId: detail.storeRequisitionDetailsId,

          reqAcknowledgedQty: reqItem?.acknowledgedQty ?? null,
          alreadyReturnedQty: reqItem?.returnedQty ?? null,

          totalRequestedReturnQty: detail.requestedReturnQty,
          totalAcknowledgedReturnQty: detail.acknowledgedReturnQty,

          branchInHandStock,
          userInHandStock,

          createdBy: detailCreatedBy,
          updatedBy: detailUpdatedBy,
          availableQtyToReturn,
          inTransitStock: inTransitQtyToAcknowledge,
        };
      })
    )
  );

  const omittedSRR = customOmit<
    StoreRequisitionReturn,
    "requisitionFrom" | "ccId" | "approvedBy" | "rejectBy" | "acknowledgementBy"
  >(storeRequisitionReturn, [
    "requisitionFrom",
    "ccId",
    "approvedBy",
    "rejectBy",
    "acknowledgementBy",
  ]);

  logger.info("exiting::toStoreRequisitionReturnDTO::mapper");

  return {
    ...omittedSRR.rest,

    requisitionFrom: toIdValue(reqFrom, "name"),
    branch: toIdValue(branch, "name"),
    cc: toIdValue(branch, "name"),

    approvedBy,
    rejectBy,
    acknowledgementBy,

    storeRequisitionReturnDetails: detailDTO,
  };
};

export const toStoreRequisitionReturnDetailDTO = async (
  details: StoreRequisitionReturnDetails[]
): Promise<StrReturnDetailDTO[]> => {
  return await Promise.all(
    details.map(async (detail) => {
      const omittedData = customOmit<
        StoreRequisitionReturnDetails,
        "itemId" | "createdBy" | "updatedBy"
      >(detail, ["itemId", "createdBy", "updatedBy"]);
      const itemDTO = detail.itemId
        ? await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true
          )
        : null;
      const createdBy = detail.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.createdBy)
        : null;
      const updatedBy = detail.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.updatedBy)
        : null;

      return {
        ...omittedData.rest,
        item: itemDTO ? await itemMasterToDto(itemDTO) : null,
        createdBy,
        updatedBy,
      };
    })
  );
};
