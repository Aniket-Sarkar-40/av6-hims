import { getRequisitionItemDetailsFromDb } from "@/repository/purchase/storeRequisition.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  GetStoreRequisitionReturnResponse,
  StoreRequisitionReturnDetailDTO,
  StoreRequisitionReturnDTO,
} from "@/types/purchase/requisitionReturn.js";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";
import { PmsStoreRequisitionReturn } from "@repo/db/generated/prisma/client";

export const toStoreRequisitionReturnDTO = async (
  storeRequisitionReturn: GetStoreRequisitionReturnResponse
): Promise<StoreRequisitionReturnDTO> => {
  const branchDTO = await branchService.getBranchById(
    storeRequisitionReturn.branchId,
    true
  );
  const warehouseDTO = await warehouseService.getWarehouseById(
    storeRequisitionReturn.warehouseId,
    true
  );

  const approvedBy = storeRequisitionReturn.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.approvedBy,
        true
      )
    : null;
  const rejectBy = storeRequisitionReturn.rejectBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.rejectBy,
        true
      )
    : null;
  const acknowledgementBy = storeRequisitionReturn.acknowledgementBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.acknowledgementBy,
        true
      )
    : null;

  const requisitionFrom = storeRequisitionReturn.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisitionReturn.requisitionFrom,
        true
      )
    : null;

  // Build detailDTO correctly with async/await
  const detailDTO: StoreRequisitionReturnDetailDTO[] = await Promise.all(
    storeRequisitionReturn.storeRequisitionReturnDetails.flatMap((detail) =>
      detail.requisitionReturnItemDetails.map(async (itemDetail) => {
        const item = await itemService.getItemById(
          { id: detail.itemId, isZeroQty: false, isCustomPricing: false },
          true
        );

        const inHandBranchQty = await getItemStockQtyByBatchWise(
          detail.itemId,
          { branchId: storeRequisitionReturn.branchId },
          itemDetail.batchNo,
          itemDetail.expiryDate,
          itemDetail.isFoc
        );

        const inHandWarehouseQty = await getItemStockQtyByBatchWise(
          detail.itemId,
          { warehouseId: storeRequisitionReturn.warehouseId },
          itemDetail.batchNo,
          itemDetail.expiryDate,
          itemDetail.isFoc
        );

        const reqItem = await getRequisitionItemDetailsFromDb(
          itemDetail.requisitionItemDetailsId
        );

        return {
          ...itemDetail,
          item,
          storeRequisitionDetailsId: detail.storeRequisitionDetailsId,
          reqAcknowledgedQty: reqItem?.acknowledgedQty || null,
          alreadyReturnedQty: reqItem?.returnedQty || null,
          totalAcknowledgedReturnQty: detail.acknowledgedReturnQty,
          totalRequestedReturnQty: detail.requestedReturnQty,
          warehouseInHandStock: inHandWarehouseQty,
          branchInHandStock: inHandBranchQty,
        };
      })
    )
  );

  const omittedSRR = customOmit<
    PmsStoreRequisitionReturn,
    | "requisitionFrom"
    | "branchId"
    | "warehouseId"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  >(storeRequisitionReturn, [
    "requisitionFrom",
    "branchId",
    "warehouseId",
    "approvedBy",
    "rejectBy",
    "acknowledgementBy",
  ]);

  return {
    ...omittedSRR.rest,
    branch: toIdValue(branchDTO, "name"),
    warehouse: toIdValue(warehouseDTO, "name"),
    requisitionFrom: toIdValue(requisitionFrom, "name"),
    approvedBy,
    rejectBy,
    acknowledgementBy,
    storeRequisitionReturnDetails: detailDTO,
  };
};

// export const toStoreRequisitionBatchWiseDTO = async (
//   storeRequisition: StoreReqBatchWiseResponse
// ): Promise<StoreRequisitionBatchWiseDTO> => {
//   const branchDTO = await branchService.getBranchById(storeRequisitionReturn.branchId, true);
//   const warehouseDTO = await warehouseService.getWarehouseById(storeRequisitionReturn.warehouseId, true);
//   const detailDTO: RequisitionItemDetailDTO[] = await Promise.all(
//     storeRequisitionReturn.requisitionItemDetails.map(async (detail) => await toRequisitionItemDetailDTO(detail))
//   );

//   return {
//     ...storeRequisition,
//     branch: branchDTO,
//     warehouse: warehouseDTO,
//     requisitionItemDetails: detailDTO,
//   };
// };
