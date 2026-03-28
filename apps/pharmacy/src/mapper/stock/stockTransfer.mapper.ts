import {
  getItemStockQtyByBatchWise,
  getItemStockQtyByLocation,
} from "@/repository/stock/stock.repository.js";
import { itemService } from "@/services/item/item.service.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import { RawItemStock } from "@/types/stock/stock.js";
import {
  StockTransferDetailsDTO,
  StockTransferDTO,
} from "@/types/stock/stockTransfer.js";
import {
  PmsItemStock,
  PmsStockTransfer,
  PmsStockTransferDetails,
} from "@repo/db/generated/prisma/client";

export const toStockTransferDTO = async (
  stockTransfer: PmsStockTransfer & {
    stockTransferDetails: PmsStockTransferDetails[];
  },
): Promise<StockTransferDTO> => {
  const staff = await employeeService.getEmployeeById(
    stockTransfer.staffId,
    true,
  );
  const ccDTO = await warehouseService.getWarehouseByIdWoDTO(
    stockTransfer.ccId,
    true,
  );
  const formWarehouse = await warehouseService.getWarehouseByIdWoDTO(
    stockTransfer.fromId,
    true,
  );
  const toWarehouse = await warehouseService.getWarehouseByIdWoDTO(
    stockTransfer.toId,
    true,
  );
  const fromBranch = await branchService.getBranchByIdWoDTO(
    stockTransfer.fromId,
    true,
  );
  const toBranch = await branchService.getBranchByIdWoDTO(
    stockTransfer.toId,
    true,
  );

  const createdBy = stockTransfer.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockTransfer.createdBy,
        true,
      )
    : null;

  const approvedBy = stockTransfer.approvedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockTransfer.approvedBy,
        true,
      )
    : null;
  const acknowledgedBy = stockTransfer.acknowledgedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockTransfer.acknowledgedBy,
        true,
      )
    : null;
  const returnApprovedBy = stockTransfer.returnApprovedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockTransfer.returnApprovedBy,
        true,
      )
    : null;
  const form = formWarehouse ? formWarehouse : fromBranch;
  const to = toWarehouse ? toWarehouse : toBranch;

  const detailDTO: StockTransferDetailsDTO[] = await Promise.all(
    stockTransfer.stockTransferDetails.map(async (detail) => {
      const item = await itemService.getItemById(
        { id: detail.itemId, isZeroQty: false, isCustomPricing: false },
        true,
      );
      const fromStock = await getItemStockQtyByBatchWise(
        detail.itemId,
        { branchId: stockTransfer.fromId },
        detail.batchNo,
        detail.expiryDate,
        detail.isFoc,
      );
      const toStock = await getItemStockQtyByLocation(detail.itemId, {
        branchId: stockTransfer.toId,
      });

      return {
        id: detail.id,
        stId: detail.stId,
        item: item,
        batchNo: detail.batchNo,
        isFoc: detail.isFoc,
        expiryDate: detail.expiryDate,
        quantity: detail.quantity,
        acknowledgedQuantity: detail.acknowledgedQuantity,
        returnQuantity: detail.returnQuantity,
        fromBranchItemQty: fromStock,
        toBranchItemQty: toStock,
      };
    }),
  );

  return {
    id: stockTransfer.id,
    stockTransferNumber: stockTransfer.stockTransferNumber,
    staff: staff,
    ccId: ccDTO,
    from: form,
    to: to,
    date: stockTransfer.date,
    status: stockTransfer.status,
    returnStatus: stockTransfer.returnStatus,
    createdBy: createdBy,
    createdAt: stockTransfer.createdAt,
    updatedBy: stockTransfer.updatedBy,
    updatedAt: stockTransfer.updatedAt,
    approvedBy: approvedBy,
    approvedAt: stockTransfer.approvedAt,
    acknowledgedBy: acknowledgedBy,
    acknowledgedAt: stockTransfer.acknowledgedAt,
    returnApprovedBy: returnApprovedBy,
    returnApprovedAt: stockTransfer.returnApprovedAt,
    stockTransferDetails: detailDTO,
  };
};

export const toStockEntity = (raw: RawItemStock): PmsItemStock => {
  return {
    id: raw.id,
    itemId: raw.item_id,
    warehouseId: raw.warehouse_id ?? null,
    branchId: raw.branch_id ?? null,
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
