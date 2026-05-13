import { getGrnDetailsByIdFromDb } from "@/repository/grn/grn.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  GoodReceiveReturnDetailDTO,
  GoodReceiveReturnDTO,
  GrnReturnResponse,
} from "@/types/grn/grnReturn.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit } from "av6-utils";
import { omitAudit, toIdValue } from "av6-utils";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";

export const toGrnReturnDTO = async (
  data: GrnReturnResponse[]
): Promise<GoodReceiveReturnDTO[]> => {
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const settings = await settingsService.getSettings();

  return Promise.all(
    data.map(async (grnReturn) => {
      const omittedGrnReturn = customOmit<
        GrnReturnResponse,
        | BaseModelAttrWoCancel
        | "approvedBy"
        | "rejectedBy"
        | "createdBy"
        | "goodReceiveReturnDetails"
        | "currencyId"
      >(grnReturn, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "approvedBy",
        "rejectedBy",
        "goodReceiveReturnDetails",
        "currencyId",
      ]);

      const supplierDTO = suppliers.find(
        (supplier) => supplier.id === grnReturn.supplierId
      );
      const currency = grnReturn.currencyId
        ? await currencyService.getCurrencyById(grnReturn.currencyId)
        : null;
      const ccSettingsId = settings?.warehouseMode;
      let warehouseDTO, branchDTO;
      if (ccSettingsId) {
        warehouseDTO = await warehouseService.getWarehouseById(
          grnReturn.ccId,
          true
        );
      } else {
        branchDTO = await branchService.getBranchById(grnReturn.ccId, true);
      }

      const createdBy = grnReturn.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.createdBy,
            true
          )
        : null;
      const approvedBy = grnReturn.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.approvedBy,
            true
          )
        : null;
      const rejectedBy = grnReturn.rejectedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.rejectedBy,
            true
          )
        : null;

      const detailDTO: GoodReceiveReturnDetailDTO[] = await Promise.all(
        (grnReturn.goodReceiveReturnDetails || []).map(async (detail) => {
          const item = await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true
          );
          const inHandQty =
            (await getItemStockQtyByBatchWise({
              itemId: detail.itemId,
              ccId: grnReturn.ccId,
              batchNo: detail.batchNo,
              expiryDate: detail.expiryDate,
            })) || null;

          const grnDetails = await getGrnDetailsByIdFromDb(detail.grnDetailId);

          return {
            ...detail,
            inHandQty: inHandQty ? inHandQty : 0,
            returnedQty: grnDetails?.returnQuantity ?? 0,
            purchasePrice: grnDetails?.purchasedPrice ?? 0,
            item: item ? await itemMasterToDto(item) : null,
          };
        })
      );

      return {
        ...omittedGrnReturn.rest,
        goodReceiveReturnDetails: omitAudit(detailDTO),
        currency: toIdValue(currency, "name"),
        warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
        branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
        supplier: toIdValue(supplierDTO, "name"),
        createdBy: createdBy,
        approvedBy: approvedBy,
        rejectedBy: rejectedBy,
      };
    })
  );
};
