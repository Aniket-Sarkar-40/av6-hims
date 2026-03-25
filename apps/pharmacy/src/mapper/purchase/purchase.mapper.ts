import { distributorService } from "@/services/distributor/distributor.service.js";
import { itemService } from "@/services/item/item.service.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { storageService } from "@/services/master/storage.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import {
  PurchaseOrderDetailDTO,
  PurchaseOrderDetailsBase,
  PurchaseOrderDetailsDto,
  PurchaseOrderDTO,
} from "@/types/purchase/purchase.js";

import {
  PmsPurchaseOrder,
  PmsPurchaseOrderDetails,
  PmsStorage,
} from "@repo/db/generated/prisma/client";

export const toPurchaseOrderDTO = async (
  purchaseOrder: PmsPurchaseOrder & {
    purchaseOrderDetails: PmsPurchaseOrderDetails[];
  },
): Promise<PurchaseOrderDTO> => {
  const warehouseDTO = await warehouseService.getWarehouseById(
    purchaseOrder.warehouseId,
    true,
  );
  const distributorDTO = await distributorService.getDistributorByIdWoDto(
    purchaseOrder.distributorId,
    true,
  );

  const createdBy = purchaseOrder.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        purchaseOrder.createdBy,
        true,
      )
    : null;

  let storage: Storage | null = null;
  if (purchaseOrder.storageId != null) {
    storage = await storageService.getStorageById(
      purchaseOrder.storageId,
      true,
    );
  }

  const detailDTO: PurchaseOrderDetailDTO[] = await Promise.all(
    purchaseOrder.purchaseOrderDetails.map(async (detail) => {
      const itemDTO = await itemService.getItemByIdWoDTO(detail.itemId, true);
      const itemCategoryDTO = detail.itemCategoryId
        ? await medCategoryService.getMedCategoryByIdWODto(
            detail.itemCategoryId,
            true,
          )
        : null;

      return {
        id: detail.id,
        purchaseId: detail.purchaseId,
        uom: detail.uom,
        item: itemDTO,
        itemCategoryId: detail.itemCategoryId,
        itemCategory: itemCategoryDTO,
        itemMedCategory: detail.itemMedCategory,
        medType: detail.medType,
        medComp: detail.medComp,
        medUnit: detail.medUnit,
        manufacturer: detail.manufacturer,
        packSize: detail.packSize,
        drugType: detail.drugType,
        medTypeId: detail.medTypeId,
        medCompId: detail.medCompId,
        medUnitId: detail.medUnitId,
        manufacturerId: detail.manufacturerId,
        packSizeId: detail.packSizeId,
        drugTypeId: detail.drugTypeId,
        mrp: Number(detail.mrp),
        purchasedPrice: Number(detail.purchasedPrice),
        packingQty: detail.packingQty,
        quantity: detail.quantity,
        receivedQty: detail.receivedQty ?? null,
        totalAmount: Number(detail.totalAmount),
        isActive: detail.isActive,
        createdBy: detail.createdBy,
        updatedBy: detail.updatedBy,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
      };
    }),
  );

  return {
    id: purchaseOrder.id,
    poNumber: purchaseOrder.poNumber,
    date: purchaseOrder.date,
    distributor: distributorDTO,
    warehouse: warehouseDTO,
    grandTotal: Number(purchaseOrder.grandTotal),
    status: purchaseOrder.status,
    notes: purchaseOrder.notes,
    currency: purchaseOrder.currency,
    storage: storage,
    paymentTerms: purchaseOrder.paymentTerms,
    isActive: purchaseOrder.isActive,
    createdBy: createdBy,
    updatedBy: purchaseOrder.updatedBy,
    createdAt: purchaseOrder.createdAt,
    updatedAt: purchaseOrder.updatedAt,
    purchaseOrderDetailDTO: detailDTO,
    lastVerifiedBy: purchaseOrder.lastVerifiedBy
      ? await employeeService.getEmployeeByIdFrmCacheOrDb(
          purchaseOrder.lastVerifiedBy,
          true,
        )
      : null,
    lastVerifiedAt: purchaseOrder.lastVerifiedAt ?? null,
  };
};

export const toPurchaseOrderDetailsDto = async (
  poDetails: PurchaseOrderDetailsBase[],
): Promise<PurchaseOrderDetailsDto[]> => {
  const warehouses = await warehouseService.getAllWarehouseWoDTO();
  const distributors = await distributorService.getDistributorWoDto(true);
  const staffs = await employeeService.getAllEmployeesWoDto();
  const items = await itemService.getAllItemWoDto();

  const approvalActions = await getAllApprovalActDetails(
    "PURCHASE_ORDER",
    "PHARMACY",
  );

  return Promise.all(
    poDetails.map(async (poDet) => {
      const warehouse =
        warehouses.find((w) => w.id === poDet.purchase.warehouseId) ?? null;
      const distributor =
        distributors.find((d) => d.id === poDet.purchase.distributorId) ?? null;
      const createdBy = poDet.createdBy
        ? (staffs.find((st) => st.id === poDet.createdBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            poDet.createdBy,
          )) ??
          null)
        : null;
      const item = items.find((item) => item.id === poDet.itemId) ?? null;

      const currApprovalActions = approvalActions.filter(
        (act) => act.approvalInstance.subjectId === poDet.purchaseId,
      );

      const level1Action = currApprovalActions.find((act) => act.level === 1);
      const level2Action = currApprovalActions.find((act) => act.level === 2);
      const level3Action = currApprovalActions.find((act) => act.level === 3);

      const level1Approver = level1Action?.actedBy
        ? (staffs.find((st) => st.id === level1Action?.actedBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            level1Action?.actedBy,
          )) ??
          null)
        : null;

      const level2Approver = level2Action?.actedBy
        ? (staffs.find((st) => st.id === level2Action?.actedBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            level2Action?.actedBy,
          )) ??
          null)
        : null;

      const level3Approver = level3Action?.actedBy
        ? (staffs.find((st) => st.id === level3Action?.actedBy) ??
          (await employeeService.getEmployeeByIdFrmCacheOrDb(
            level3Action?.actedBy,
          )) ??
          null)
        : null;

      return {
        ...poDet,
        item,
        distributor,
        warehouse,
        createdBy,
        approvedByL1: level1Approver,
        approvedByL2: level2Approver,
        approvedByL3: level3Approver,
      };
    }),
  );
};
