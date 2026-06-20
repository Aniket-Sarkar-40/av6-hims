import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { RawItemStock } from "@/types/stock/stock.js";
import {
  StockTransferDetailRowDTO,
  StockTransferDetailsDTO,
  StockTransferDTO,
  StockTransferResponse,
} from "@/types/stock/stockTransfer.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import {
  InvItemStock,
  InvStockTransferDetails,
} from "@repo/db/generated/prisma/client";
import { toIdValue } from "av6-utils";

export const toStockTransferDTO = async (
  stockTransfers: StockTransferResponse[]
): Promise<StockTransferDTO[]> => {
  const allWarehouses = await warehouseService.getAllWarehouse(true);
  const allItems = await itemMasterService.getAllItemMaster(true);
  const allBranches = await branchService.getAllBranch(true);

  return Promise.all(
    stockTransfers.map(async (stockTransfer) => {
      const staff = await employeeService.getEmployeeByIdFrmCacheOrDb(
        stockTransfer.staffId
      );
      const ccWarehouseDTO = allWarehouses.find(
        (warehouse) => warehouse.id === stockTransfer.ccId
      );
      const ccBranchDTO = allBranches.find(
        (branch) => branch.id === stockTransfer.ccId
      );
      const fromBranch = allBranches.find(
        (branch) => branch.id === stockTransfer.fromId
      );
      const toBranch = allBranches.find(
        (branch) => branch.id === stockTransfer.toId
      );

      const createdBy = stockTransfer.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            stockTransfer.createdBy
          )
        : null;

      const approvedBy = stockTransfer.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            stockTransfer.approvedBy
          )
        : null;
      const acknowledgedBy = stockTransfer.acknowledgedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            stockTransfer.acknowledgedBy
          )
        : null;
      const returnApprovedBy = stockTransfer.returnApprovedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            stockTransfer.returnApprovedBy
          )
        : null;
      const from = toIdValue(fromBranch, "name");
      const to = toIdValue(toBranch, "name");
      const cc = ccWarehouseDTO
        ? toIdValue(ccWarehouseDTO, "name")
        : toIdValue(ccBranchDTO, "name");

      const detailDTO: StockTransferDetailsDTO[] = await Promise.all(
        stockTransfer.stockTransferDetails.map(async (detail) => {
          const item = allItems.find((item) => item.id === detail.itemId);

          const fromStock = await getItemStockQtyByBatchWise({
            itemId: detail.itemId,
            ccId: stockTransfer.fromId,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          });
          const toStock = await getItemStockQtyByBatchWise({
            itemId: detail.itemId,
            ccId: stockTransfer.toId,
            batchNo: detail.batchNo,
            expiryDate: detail.expiryDate,
            isFoc: detail.isFoc,
          });

          return {
            ...detail,
            item: item ?? null,
            fromBranchItemQty: fromStock,
            toBranchItemQty: toStock,
          };
        })
      );

      return {
        ...stockTransfer,
        staff,
        cc,
        from,
        to,
        createdBy,
        approvedBy,
        acknowledgedBy,
        returnApprovedBy,
        stockTransferDetails: detailDTO,
      };
    })
  );
};

export const toStockEntity = (raw: RawItemStock): InvItemStock => {
  return {
    id: raw.id,
    itemId: raw.item_id,
    ccId: raw.cc_id ?? null,
    userId: raw.user_id ?? null,
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

export const toStockTransferDetailDTO = async (
  details: InvStockTransferDetails[]
): Promise<StockTransferDetailRowDTO[]> => {
  return Promise.all(
    details.map(async (detail) => {
      const item = await itemMasterService.getItemMasterById(
        { itemId: detail.itemId },
        true
      );
      const createdBy = detail.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.createdBy)
        : null;
      const updatedBy = detail.updatedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(detail.updatedBy)
        : null;

      return {
        ...detail,
        item: item ? await itemMasterToDto(item) : null,
        createdBy,
        updatedBy,
      };
    })
  );
};
