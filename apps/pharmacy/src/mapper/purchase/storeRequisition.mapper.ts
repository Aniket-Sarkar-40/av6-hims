import { getPendingSRRFromSRId } from "@/repository/purchase/requisitionReturn.repository.js";
import { getStoreRequisitionByIdFromDb } from "@/repository/purchase/storeRequisition.repository.js";
import { getItemStockQtyByLocation } from "@/repository/stock/stock.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  ReqItemDetailsResponse,
  ReqItemDetailsResponseBase,
  RequisitionDetailsResponse,
  RequisitionDetailsResponseBase,
  RequisitionItemDetailDTO,
  RequisitionItemDetailResponse,
  StoreReqBatchWiseResponse,
  StoreRequisitionBatchWiseDTO,
  StoreRequisitionDetailDTO,
  StoreRequisitionDTO,
  StoreRequisitionPdfDTO,
  StoreRequisitionResponse,
} from "@/types/purchase/storeRequisition.js";
import { customOmit } from "av6-core";

export const toStoreRequisitionDTO = async (
  storeRequisition: StoreRequisitionResponse,
): Promise<StoreRequisitionDTO> => {
  const branchDTO = await branchService.getBranchById(
    storeRequisition.branchId,
    true,
  );
  const warehouseDTO = await warehouseService.getWarehouseById(
    storeRequisition.warehouseId,
    true,
  );
  const createdBy = storeRequisition.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.createdBy,
        true,
      )
    : null;

  const approvedBy = storeRequisition.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.approvedBy,
        true,
      )
    : null;
  const rejectBy = storeRequisition.rejectBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.rejectBy,
        true,
      )
    : null;
  const acknowledgementBy = storeRequisition.acknowledgementBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.acknowledgementBy,
        true,
      )
    : null;
  const pendingSRR = await getPendingSRRFromSRId(storeRequisition.id);
  const isAnyPendingReturn = pendingSRR.length > 0;

  const detailDTO: StoreRequisitionDetailDTO[] = await Promise.all(
    storeRequisition.storeRequisitionDetails.map(async (detail) => {
      const item = await itemService.getItemByIdWoDTO(detail.itemId, true);
      const itemCategory = await medCategoryService.getMedCategoryByIdWODto(
        detail.itemCategoryId,
        true,
      );

      const inHandBranchQty = await getItemStockQtyByLocation(detail.itemId, {
        branchId: storeRequisition.branchId,
      });
      const inHandWarehouseQty = await getItemStockQtyByLocation(
        detail.itemId,
        {
          warehouseId: storeRequisition.warehouseId,
        },
      );

      return {
        ...detail,
        warehouseInHandStock: inHandWarehouseQty,
        branchInHandStock: inHandBranchQty,
        item: item,
        itemCategory,
      };
    }),
  );

  return {
    ...storeRequisition,
    isAnyPendingReturn,
    branch: branchDTO,
    warehouse: warehouseDTO,
    storeRequisitionDetails: detailDTO,
    createdBy: createdBy,
    approvedBy: approvedBy,
    rejectBy: rejectBy,
    acknowledgementBy: acknowledgementBy,
  };
};

export const toRequisitionItemDetailDTO = async (
  storeRequisition: RequisitionItemDetailResponse,
): Promise<RequisitionItemDetailDTO> => {
  const item = await itemService.getItemByIdWoDTO(
    storeRequisition.itemId,
    true,
  );
  const itemCategory = await medCategoryService.getMedCategoryByIdWODto(
    storeRequisition.storeRequisitionDetails.itemCategoryId,
    true,
  );
  const storeReq = await getStoreRequisitionByIdFromDb(
    storeRequisition.storeRequisitionDetails.storeRequisitionId,
  );

  const inHandBranchQty = storeReq
    ? await getItemStockQtyByLocation(storeRequisition.itemId, {
        branchId: storeReq.branchId,
      })
    : null;
  const inHandWarehouseQty = await getItemStockQtyByLocation(
    storeRequisition.itemId,
    {
      warehouseId: storeRequisition.ccId,
    },
  );

  const detailDTO: StoreRequisitionDetailDTO = {
    ...storeRequisition.storeRequisitionDetails,
    item,
    itemCategory,
    warehouseInHandStock: inHandWarehouseQty,
    branchInHandStock: inHandBranchQty,
  };

  return {
    ...storeRequisition,
    storeRequisitionDetails: detailDTO,
  };
};

export const toStoreRequisitionBatchWiseDTO = async (
  storeRequisition: StoreReqBatchWiseResponse,
): Promise<StoreRequisitionBatchWiseDTO> => {
  const branchDTO = await branchService.getBranchById(
    storeRequisition.branchId,
    true,
  );
  const warehouseDTO = await warehouseService.getWarehouseById(
    storeRequisition.warehouseId,
    true,
  );
  const detailDTO: RequisitionItemDetailDTO[] = await Promise.all(
    storeRequisition.requisitionItemDetails.map(
      async (detail) => await toRequisitionItemDetailDTO(detail),
    ),
  );

  return {
    ...storeRequisition,
    branch: branchDTO,
    warehouse: warehouseDTO,
    requisitionItemDetails: detailDTO,
  };
};

export const toStoreRequisitionPdfDTO = async (
  storeRequisition: StoreRequisitionBatchWiseDTO,
): Promise<StoreRequisitionPdfDTO> => {
  const requisitionFrom = storeRequisition.requisitionFrom
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.requisitionFrom,
        true,
      )
    : null;
  const createdBy = storeRequisition.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.createdBy,
        true,
      )
    : null;

  const approvedBy = storeRequisition.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.approvedBy,
        true,
      )
    : null;
  const rejectBy = storeRequisition.rejectBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.rejectBy,
        true,
      )
    : null;
  const acknowledgementBy = storeRequisition.acknowledgementBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        storeRequisition.acknowledgementBy,
        true,
      )
    : null;

  const omittedStoreRequisition = customOmit<
    StoreRequisitionBatchWiseDTO,
    | "requisitionFrom"
    | "createdBy"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  >(storeRequisition, [
    "requisitionFrom",
    "createdBy",
    "approvedBy",
    "rejectBy",
    "acknowledgementBy",
  ]);
  return {
    ...omittedStoreRequisition.rest,
    requisitionFrom,
    createdBy,
    approvedBy,
    rejectBy,
    acknowledgementBy,
  };
};

export const toRequisitionDetailsDTO = async (
  requisitionDetailsInput: RequisitionDetailsResponseBase[],
): Promise<RequisitionDetailsResponse[]> => {
  const items = await itemService.getAllItemWoDto();
  const staffs = await employeeService.getAllEmployeesWoDto();
  const warehouses = await warehouseService.getAllWarehouseWoDTO();
  const branches = await branchService.getAllBranchWoDTO();

  return Promise.all(
    requisitionDetailsInput.map(async (requisitionDetail) => {
      const item = items.find((item) => item.id === requisitionDetail.itemId);
      const createdBy = requisitionDetail.createdBy
        ? (staffs.find((st) => st.id === requisitionDetail.createdBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisitionDetail.createdBy,
          )) ??
          null)
        : null;
      const acknowledgedBy = requisitionDetail.storeRequisition
        .acknowledgementBy
        ? (staffs.find(
            (st) =>
              st.id === requisitionDetail.storeRequisition.acknowledgementBy,
          ) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisitionDetail.storeRequisition.acknowledgementBy,
          )) ??
          null)
        : null;
      const approvedBy = requisitionDetail.storeRequisition.approvedBy
        ? (staffs.find(
            (st) => st.id === requisitionDetail.storeRequisition.approvedBy,
          ) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            requisitionDetail.storeRequisition.approvedBy,
          )) ??
          null)
        : null;

      const warehouse =
        warehouses.find(
          (w) => w.id === requisitionDetail.storeRequisition.warehouseId,
        ) ?? null;
      const branch =
        branches.find(
          (b) => b.id === requisitionDetail.storeRequisition.branchId,
        ) ?? null;

      return {
        ...requisitionDetail,
        item: item ?? null,
        createdBy,
        acknowledgedBy,
        approvedBy,
        warehouse,
        branch,
      };
    }),
  );
};

export const toReqItemDetailsDto = async (
  reqItemDetails: ReqItemDetailsResponseBase[],
): Promise<ReqItemDetailsResponse[]> => {
  const items = await itemService.getAllItemWoDto();
  const staffs = await employeeService.getAllEmployeesWoDto();
  const warehouses = await warehouseService.getAllWarehouseWoDTO();
  const branches = await branchService.getAllBranchWoDTO();

  return Promise.all(
    reqItemDetails.map(async (reqItem) => {
      const item =
        items.find(
          (item) => item.id === reqItem.storeRequisitionDetails.itemId,
        ) ?? null;
      const createdBy = reqItem.storeRequisition.createdBy
        ? (staffs.find((st) => st.id === reqItem.storeRequisition.createdBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            reqItem.storeRequisition.createdBy,
          )) ??
          null)
        : null;
      const acknowledgedBy = reqItem.storeRequisition.acknowledgementBy
        ? (staffs.find(
            (st) => st.id === reqItem.storeRequisition.acknowledgementBy,
          ) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            reqItem.storeRequisition.acknowledgementBy,
          )) ??
          null)
        : null;
      const approvedBy = reqItem.storeRequisition.approvedBy
        ? (staffs.find((st) => st.id === reqItem.storeRequisition.approvedBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            reqItem.storeRequisition.approvedBy,
          )) ??
          null)
        : null;

      const warehouse =
        warehouses.find((w) => w.id === reqItem.storeRequisition.warehouseId) ??
        null;
      const branch =
        branches.find((b) => b.id === reqItem.storeRequisition.branchId) ??
        null;

      const omittedReq = customOmit(reqItem, ["storeRequisition"]);

      return {
        ...omittedReq.rest,
        storeRequisitionDetails: {
          ...omittedReq.rest.storeRequisitionDetails,
          item,
          storeRequisition: {
            ...omittedReq.omitted.storeRequisition,
            createdBy,
            acknowledgedBy,
            approvedBy,
            warehouse,
            branch,
          },
        },
      };
    }),
  );
};
