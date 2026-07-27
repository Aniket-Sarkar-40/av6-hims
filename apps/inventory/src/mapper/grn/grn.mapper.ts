import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import { branchService } from "@/services/master/branch.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { settingsService } from "@/services/master/settings.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";
import {
  GoodReceiveDetailDTO,
  GoodReceiveDetailPdfDTO,
  GrnDetailDTO,
  GrnDTO,
  GrnPdfDTO,
  GrnResponse,
} from "@/types/grn/grn.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit } from "av6-utils";
import { omitAudit, toIdValue } from "av6-utils";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { itemMasterToDto } from "@/utils/commonResponse.utils.js";
import { ItemStockType } from "@repo/db/generated/prisma/enums.js";
import { InvGoodReceiveDetails } from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";
import { numberToWords } from "@repo/shared/utils/helper.utils.js";

export const toGrnDTO = async (data: GrnResponse[]): Promise<GrnDTO[]> => {
  const suppliers = await itemSupplierService.getAllItemSupplier(true);

  const settings = await settingsService.getSettings(true);

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
        (supplier) => supplier.id === grn.supplierId,
      );
      const ccSettingsId = settings?.warehouseMode;

      let warehouseDTO;
      let branchDTO;

      if (ccSettingsId) {
        warehouseDTO = await warehouseService.getWarehouseByIdWoDTO(
          grn.ccId,
          true,
        );
      } else {
        branchDTO = await branchService.getBranchByIdWoDTO(grn.ccId, true);
      }

      const createdBy = grn.createdBy
        ? await employeeService.getEmployeeByIdFrmCacheOrDb(grn.createdBy)
        : null;
      const currency = grn.currencyId
        ? await currencyService.getCurrencyById(grn.currencyId)
        : null;

      const detailDTO: GrnDetailDTO[] = await Promise.all(
        (grn.goodReceiveDetails || []).map(async (detail) => {
          const omittedDetail = customOmit<
            InvGoodReceiveDetails,
            "createdBy" | "updatedBy"
          >(detail, ["createdBy", "updatedBy"]);

          const item = await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true,
          );

          const inHandQty =
            (await getItemStockQtyByBatchWise({
              itemId: detail.itemId,
              ccId: grn.ccId,
              batchNo: detail.batchNo ?? null,
              expiryDate: detail.expiryDate ?? null,
            })) || null;

          const createdBy = detail.createdBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.createdBy,
              )
            : null;
          const updatedBy = detail.updatedBy
            ? await employeeService.getEmployeeByIdFrmCacheOrDb(
                detail.updatedBy,
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
          const alreadyReturnedQty = Number(detail.returnQuantity ?? 0);
          const grnRemainingQty = Math.max(totalGrnQty - alreadyReturnedQty, 0);
          const availableTotalQtyToReturn = Math.min(
            grnRemainingQty,
            stockQtyForReturn,
          );

          return {
            ...omittedDetail.rest,
            item: item ? await itemMasterToDto(item) : null,
            inHandQty: inHandQty ?? 0,
            grnQty: detail.quantity ?? 0,
            totalGrnQty,
            alreadyReturnedQty,
            grnRemainingQty,
            stockQtyForReturn,
            availableTotalQtyToReturn,
            createdBy: omitAudit(createdBy),
            updatedBy: omitAudit(updatedBy),
          };
        }),
      );

      const location = warehouseDTO
        ? toIdValue(warehouseDTO, "name")
        : toIdValue(branchDTO, "name");

      return {
        ...omittedGrn.rest,
        currency: toIdValue(currency, "name"),
        supplier: toIdValue(supplierDTO, "vendorCompanyName"),
        warehouse: ccSettingsId ? toIdValue(warehouseDTO, "name") : null,
        branch: ccSettingsId ? null : toIdValue(branchDTO, "name"),
        location,
        createdBy,
        goodReceiveDetails: detailDTO,
      };
    }),
  );
};

export const toGrnDetailsDto = async (
  grnDetails: InvGoodReceiveDetails[],
): Promise<GoodReceiveDetailDTO[]> => {
  return Promise.all(
    grnDetails.map(async (detail) => {
      const omittedData = customOmit<
        InvGoodReceiveDetails,
        "itemId" | "createdBy" | "updatedBy"
      >(detail, ["itemId", "createdBy", "updatedBy"]);
      const itemDTO = detail.itemId
        ? await itemMasterService.getItemMasterById(
            { itemId: detail.itemId },
            true,
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
    }),
  );
};

export const toGrnPdfDTO = async (grn: GrnResponse): Promise<GrnPdfDTO> => {
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

  const supplier = await itemSupplierService.getItemSupplierWoDtoById(
    grn.supplierId,
    true,
  );

  const settings = await settingsService.getSettings(true);
  const ccSettingsId = settings?.warehouseMode;
  let warehouseDTO, branchDTO;
  if (ccSettingsId) {
    warehouseDTO = await warehouseService.getWarehouseByIdWoDTO(grn.ccId, true);
  } else {
    branchDTO = await branchService.getBranchByIdWoDTO(grn.ccId, true);
  }

  const createdBy = grn.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(grn.createdBy)
    : null;
  const currency = grn.currencyId
    ? await currencyService.getCurrencyById(grn.currencyId)
    : null;
  const detailDTO: GoodReceiveDetailPdfDTO[] = await Promise.all(
    (grn.goodReceiveDetails || []).map(async (detail) => {
      const item = await itemMasterService.getItemMasterByIdWoDto(
        detail.itemId,
        true,
      );

      return {
        ...detail,
        item: item ?? null,
      };
    }),
  );

  return {
    ...omittedGrn.rest,
    currency: toIdValue(currency, "name"),
    supplier,
    cc: warehouseDTO ?? branchDTO ?? null,
    createdBy: createdBy,
    goodReceiveDetails: detailDTO,
    date: dayjs(grn.date).format("YYYY-MM-DD"),
    amountInWords: numberToWords.convert(grn.totalAmount.toNumber()),
  };
};
