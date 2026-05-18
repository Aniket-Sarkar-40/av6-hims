import { itemMasterToDto } from "@/mapper/master/itemMaster.mapper.js";
import { getRequisitionItemDetailsFromDb } from "@/repository/purchase/storeRequisition.repository.js";
import {
  getItemStockQtyByLocation,
  getItemStockQtyByUser,
} from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import {
  GetStoreRequisitionReturnResponse,
  StoreRequisitionReturnDetailDTO,
  StoreRequisitionReturnDTO,
} from "@/types/purchase/storeRequisitionReturn.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { StoreRequisitionReturn } from "@repo/db/generated/prisma/client";
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
