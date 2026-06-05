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
import { settingsService } from "@/services/master/settings.service.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { ItemStockType } from "@repo/db/generated/prisma/enums.js";
import { InvGoodReceiveReturnDetails } from "@repo/db/generated/prisma/client";

export const toGrnReturnDTO = async (
  data: GrnReturnResponse[]
): Promise<GoodReceiveReturnDTO[]> => {
  const suppliers = await itemSupplierService.getAllItemSupplier(true);
  const settings = await settingsService.getSettings(true);
  const ccSettingsId = settings?.warehouseMode;
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
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.currencyId
          )
        : null;
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
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(grnReturn.createdBy)
        : null;
      const approvedBy = grnReturn.approvedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.approvedBy
          )
        : null;
      const rejectedBy = grnReturn.rejectedBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(
            grnReturn.rejectedBy
          )
        : null;

      const detailDTO: GoodReceiveReturnDetailDTO[] = await Promise.all(
        (grnReturn.goodReceiveReturnDetails || []).map(async (detail) => {
          const omittedDetail = customOmit<
            InvGoodReceiveReturnDetails,
            "createdBy" | "updatedBy"
          >(detail, ["createdBy", "updatedBy"]);
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

          const createdBy = detail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.createdBy
              )
            : null;
          const updatedBy = detail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.updatedBy
              )
            : null;

          const stockQty = Number(inHandQty ?? 0);
          const unitDefaultValue = Number(item?.unitMaster?.defaultValue || 1);

          const stockQtyForReturn =
            settings?.itemStockType === ItemStockType.EACH_WISE
              ? stockQty / unitDefaultValue
              : stockQty;

          const totalGrnQty =
            Number(detail.quantity ?? 0) + Number(detail.focQuantity ?? 0);
          const alreadyReturnedQty = Number(grnDetails?.returnQuantity ?? 0);
          const grnRemainingQty = Math.max(totalGrnQty - alreadyReturnedQty, 0);
          const availableTotalQtyToReturn = Math.min(
            grnRemainingQty,
            stockQtyForReturn
          );

          return {
            ...omittedDetail.rest,
            quantity:
              Number(detail.quantity ?? 0) + Number(detail.focQuantity ?? 0),
            totalGrnQty:
              (grnDetails?.quantity ?? 0) + (grnDetails?.focQuantity ?? 0),
            inHandQty: inHandQty ? inHandQty : 0,
            returnedQty: grnDetails?.returnQuantity ?? 0,
            purchasePrice: Number(grnDetails?.purchasedPrice ?? 0),
            item: item ? await itemMasterToDto(item) : null,
            availableTotalQtyToReturn: availableTotalQtyToReturn,
            createdBy: omitAudit(createdBy),
            updatedBy: omitAudit(updatedBy),
          };
        })
      );

      const location = warehouseDTO
        ? toIdValue(warehouseDTO, "name")
        : toIdValue(branchDTO, "name");

      return {
        ...omittedGrnReturn.rest,
        goodReceiveReturnDetails: detailDTO,
        currency: toIdValue(currency, "name"),
        warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
        branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
        location: location,
        supplier: toIdValue(supplierDTO, "vendorCompanyName"),
        createdBy: createdBy,
        approvedBy: approvedBy,
        rejectedBy: rejectedBy,
      };
    })
  );
};
