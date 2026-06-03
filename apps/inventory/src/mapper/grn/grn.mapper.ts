import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import { GrnDetailDTO, GrnDTO, GrnResponse } from "@/types/grn/grn.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit } from "av6-utils";
import { omitAudit, toIdValue } from "av6-utils";
import { itemMasterToDto } from "../master/itemMaster.mapper.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";

export const toGrnDTO = async (data: GrnResponse[]): Promise<GrnDTO[]> => {
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const settings = await settingsService.getSettings();

  return Promise.all(
    data.map(async (grn) => {
      const omittedGrn = customOmit<
        GrnResponse,
        BaseModelAttrWoCancel | "currencyId"
      >(grn, [
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "currencyId",
      ]);

      const supplierDTO = suppliers.find(
        (supplier) => supplier.id === grn.supplierId
      );
      const ccSettingsId = settings?.warehouseMode;
      let warehouseDTO, branchDTO;
      if (ccSettingsId) {
        warehouseDTO = await warehouseService.getWarehouseById(grn.ccId, true);
      } else {
        branchDTO = await branchService.getBranchById(grn.ccId, true);
      }

      const createdBy = grn.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(grn.createdBy, true)
        : null;
      const currency = grn.currencyId
        ? await currencyService.getCurrencyById(grn.currencyId)
        : null;
      const detailDTO: GrnDetailDTO[] = await Promise.all(
        (grn.goodReceiveDetails || []).map(async (detail) => {
          const item = await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true
          );
          const inHandQty =
            (await getItemStockQtyByBatchWise({
              itemId: detail.itemId,
              ccId: grn.ccId,
              batchNo: detail.batchNo ?? null,
              expiryDate: detail.expiryDate ?? null,
            })) || null;

          const totalGrnQty =
            (detail.quantity ?? 0) + (detail.focQuantity ?? 0);
          return {
            ...detail,
            item: item ? await itemMasterToDto(item) : null,
            inHandQty: inHandQty ?? 0,
            totalGrnQty: totalGrnQty,
          };
        })
      );

      return {
        ...omittedGrn.rest,
        currency: toIdValue(currency, "name"),
        supplier: toIdValue(supplierDTO, "name"),
        warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
        branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
        createdBy: createdBy,
        goodReceiveDetails: omitAudit(detailDTO),
      };
    })
  );
};
