import { toItemSupplierDTO } from "@/mapper/master/itemSupplier.mapper.js";
import {
  createItemSupplierInDb,
  deleteItemSupplierByIdFromDb,
  getAllItemSupplierFromDb,
  getFirstItemSupplierForExcelFromDb,
  getItemSupplierByIdFromDb,
  updateItemSupplierInDb,
} from "@/repository/master/itemSupplier.repository.js";
import {
  ItemSupplierCreateInput,
  ItemSupplierDTO,
  ItemSupplierResponse,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import {
  createItemSupplierServiceValidation,
  deleteItemSupplierServiceValidation,
  updateItemSupplierServiceValidation,
} from "@/validations/service/master/itemSupplier.service.validation.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { InvItemSupplier } from "@repo/db/generated/prisma/client";
import ExcelJs from "exceljs";

const cacheKey = getRedisKey("ITEM_SUPPLIER", "all");

export const itemSupplierService = {
  async createItemSupplier(
    input: ItemSupplierCreateInput
  ): Promise<ItemSupplierDTO> {
    logger.info("entering::createItemSupplier::service");

    await createItemSupplierServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const itemSupplier = await createItemSupplierInDb(input);

    if (isCacheable && itemSupplier) {
      await addToCache(cacheKey, itemSupplier.id, itemSupplier);
    }

    const itemSupplierDTO = await toItemSupplierDTO([itemSupplier]);
    const response = itemSupplierDTO[0];

    logger.info("exiting::createItemSupplier::service");

    return response;
  },

  async updateItemSupplier(
    input: ItemSupplierUpdateInput
  ): Promise<ItemSupplierDTO> {
    logger.info("entering::updateItemSupplier::service");

    await updateItemSupplierServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    const updatedItemSupplier = await updateItemSupplierInDb(input);

    if (isCacheable && updatedItemSupplier) {
      await updateCache(cacheKey, input.id, updatedItemSupplier);
    }

    const itemSupplierDTO = await toItemSupplierDTO([updatedItemSupplier]);
    const response = itemSupplierDTO[0];

    logger.info("exiting::updateItemSupplier::service");

    return response;
  },
  async getAllItemSupplier(
    canNullReturnable: boolean = false
  ): Promise<ItemSupplierDTO[]> {
    logger.info("entering::getAllItemSupplier::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse[];
    if (isCacheable) {
      itemSupplier = (await getAllCache(cacheKey)) as ItemSupplierResponse[];
    } else {
      itemSupplier = await getAllItemSupplierFromDb();
    }
    logger.info("exiting::getAllItemSupplier::service");
    if (itemSupplier.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      else return [];
    }
    return toItemSupplierDTO(itemSupplier);
  },
  async getItemSupplierById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<ItemSupplierDTO | null> {
    logger.info("entering::getItemSupplierById::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse | null;
    if (isCacheable) {
      itemSupplier = (await getCacheById(
        cacheKey,
        id
      )) as ItemSupplierResponse | null;
    } else {
      itemSupplier = await getItemSupplierByIdFromDb(id);
    }

    if (!itemSupplier) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      } else return null;
    }

    logger.info("exiting::getItemSupplierById::service");
    const itemSupplierDTO = await toItemSupplierDTO([itemSupplier]);
    return itemSupplierDTO[0];
  },
  async deleteItemSupplierById(id: number): Promise<void> {
    logger.info("entering::deleteItemSupplierById::service");
    await deleteItemSupplierServiceValidation(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    await deleteItemSupplierByIdFromDb(id);
    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteItemSupplierById::service");
  },
  async getAllItemSupplierWoDto(
    canNullReturnable: boolean = false
  ): Promise<InvItemSupplier[]> {
    logger.info("entering::getAllItemSupplierWoDto::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.ITEM_SUPPLIER);
    let itemSupplier: ItemSupplierResponse[];
    if (isCacheable) {
      itemSupplier = (await getAllCache(cacheKey)) as ItemSupplierResponse[];
    } else {
      itemSupplier = await getAllItemSupplierFromDb();
    }
    logger.info("exiting::getAllItemSupplierWoDto::service");
    if (itemSupplier.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Item Supplier")
        );
      else return [];
    }
    return itemSupplier;
  },
  async itemSupplierExcelSampleExport(): Promise<ExcelJs.Workbook> {
    logger.info("entering::itemSupplierExcelSampleExport::service");

    const supplier = await getFirstItemSupplierForExcelFromDb();

    const tax = supplier?.taxIdentificationDetails?.[0] ?? null;
    const bank = supplier?.bankDetails?.[0] ?? null;

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Vendor");

    ws.properties.defaultRowHeight = 18;

    ws.columns = [
      { header: "Vendor Code", key: "supplierCode", width: 20 },
      { header: "Vendor Name", key: "name", width: 30 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Email", key: "email", width: 30 },
      { header: "Address", key: "address", width: 40 },
      { header: "Bill To", key: "billTo", width: 30 },
      { header: "Ship To", key: "shipTo", width: 30 },
      { header: "Vendor Type", key: "vendorType", width: 20 },

      { header: "Sales Person", key: "salesPerson", width: 25 },
      { header: "Sales Person Phone", key: "salesPersonPhone", width: 20 },
      { header: "Sales Person Email", key: "salesPersonEmail", width: 30 },

      {
        header: "Proprietary Person Name",
        key: "proprietaryPersonName",
        width: 30,
      },
      {
        header: "Proprietary Person Phone",
        key: "proprietaryPersonPhone",
        width: 25,
      },
      {
        header: "Proprietary Person Email",
        key: "proprietaryPersonEmail",
        width: 32,
      },

      { header: "Terms And Conditions", key: "termsAndCondition", width: 40 },
      {
        header: "Stock Shipment Details",
        key: "stockShipmentDetails",
        width: 40,
      },

      { header: "Contact Person Name", key: "contactPersonName", width: 30 },
      { header: "Contact Person Phone", key: "contactPersonPhone", width: 25 },
      { header: "Contact Person Email", key: "contactPersonEmail", width: 32 },

      { header: "Bank Account No", key: "accountNo", width: 25 },
      {
        header: "Bank Account Holder Name",
        key: "accountHolderName",
        width: 30,
      },
      { header: "Type Of Account", key: "typeOfAccount", width: 22 },
      { header: "IFSC Code", key: "ifscCode", width: 20 },
      { header: "Bank Name", key: "bankName", width: 30 },
      { header: "Bank Address", key: "bankAddress", width: 40 },

      {
        header: "Tax Identification Name",
        key: "taxIdentificationName",
        width: 30,
      },
      {
        header: "Tax Identification Value",
        key: "taxIdentificationValue",
        width: 25,
      },
      {
        header: "Tax Identification Number",
        key: "taxIdentificationNumber",
        width: 30,
      },
    ];

    const headerRow = ws.getRow(1);

    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    headerRow.height = 22;

    ws.addRow({
      supplierCode: supplier?.supplierCode ?? "VEN-0001",
      name: supplier?.name ?? "ABC Medical Supplier",
      phone: supplier?.phone ?? "9876543210",
      email: supplier?.email ?? "vendor@example.com",
      address: supplier?.address ?? "Kolkata, West Bengal",
      billTo: supplier?.billTo ?? "ABC Medical Supplier Billing Address",
      shipTo: supplier?.shipTo ?? "ABC Medical Supplier Shipping Address",
      vendorType: supplier?.vendorType ?? "LOCAL",

      salesPerson: supplier?.salesPerson ?? "Rahul Das",
      salesPersonPhone: supplier?.salesPersonPhone ?? "9876543211",
      salesPersonEmail: supplier?.salesPersonEmail ?? "sales@example.com",

      proprietaryPersonName: supplier?.proprietaryPersonName ?? "Amit Kumar",
      proprietaryPersonPhone: supplier?.proprietaryPersonPhone ?? "9876543212",
      proprietaryPersonEmail:
        supplier?.proprietaryPersonEmail ?? "owner@example.com",

      termsAndCondition:
        supplier?.termsAndCondition ?? "Payment within 30 days",
      stockShipmentDetails:
        supplier?.stockShipmentDetails ?? "Delivery within 7 days",

      contactPersonName: supplier?.contactPersonName ?? "Suman Roy",
      contactPersonPhone: supplier?.contactPersonPhone ?? "9876543213",
      contactPersonEmail: supplier?.contactPersonEmail ?? "contact@example.com",

      accountNo:
        bank?.accountNo != null ? String(bank.accountNo) : "1234567890",
      accountHolderName: bank?.accountHolderName ?? "ABC Medical Supplier",
      typeOfAccount: bank?.typeOfAccount ?? "CURRENT",
      ifscCode: bank?.ifscCode ?? "SBIN0001234",
      bankName: bank?.bankName ?? "State Bank of India",
      bankAddress: bank?.bankAddress ?? "Kolkata Branch",

      taxIdentificationName: tax?.taxIdentificationName ?? "GST",
      taxIdentificationValue: tax?.taxIdentificationValue ?? 1,
      taxIdentificationNumber:
        tax?.taxIdentificationNumber ?? "19ABCDE1234F1Z5",
    });

    ws.getColumn("supplierCode").numFmt = "@";
    ws.getColumn("phone").numFmt = "@";
    ws.getColumn("salesPersonPhone").numFmt = "@";
    ws.getColumn("proprietaryPersonPhone").numFmt = "@";
    ws.getColumn("contactPersonPhone").numFmt = "@";
    ws.getColumn("accountNo").numFmt = "@";
    ws.getColumn("ifscCode").numFmt = "@";
    ws.getColumn("taxIdentificationNumber").numFmt = "@";

    ws.columns.forEach((col) => {
      let max = 10;

      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });

      col.width = Math.min(max + 2, 45);
    });

    ws.views = [{ state: "frozen", ySplit: 1 }];

    logger.info("exiting::itemSupplierExcelSampleExport::service");

    return wb;
  },
};
