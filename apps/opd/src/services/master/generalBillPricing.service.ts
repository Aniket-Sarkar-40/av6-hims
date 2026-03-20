import {
  toGeneralBillPricingDTO,
  toGeneralBillPricingWithItemDTO,
  mapRowToGeneralBillPricingExcelCreateInput,
} from "@/mapper/master/generalBillPricing.mapper.js";

import {
  copyGeneralBillPricingInDb,
  CreateGeneralBillPricingExcelInDb,
  createGeneralBillPricingInDb,
  generalBillPricingBatchJob,
  getGeneralBillPricingByCcIdFromDb,
  getGeneralBillPricingByIdFromDb,
  searchGeneralBillPricingByCcIdFromDb,
  updateGeneralBillPricingInDb,
} from "@/repository/master/generalBillPricing.repository.js";
import {
  CopyGeneralBillPricing,
  CreateGeneralBillPricingInput,
  GeneralBillPricingDTO,
  GeneralBillPricingExcelInput,
  GeneralBillPricingExcelRow,
  GeneralBillPricingSearchInput,
  GeneralBillPricingWithItemDTO,
  UpdateGeneralBillPricingInput,
} from "@/types/master/generalBillPricing.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  copyGeneralBillPricingServiceValidation,
  createGeneralBillPricingServiceValidation,
  updateGeneralBillPricingServiceValidation,
} from "@/validations/service/master/generalBillPricing.service.validation.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
import { generalBillItemService } from "./generalBillItem.service.js";

export const generalBillPricingService = {
  async createGeneralBillPricing(
    input: CreateGeneralBillPricingInput,
  ): Promise<GeneralBillPricingDTO[]> {
    logger.info("entering::createGeneralBillPricing::service");

    await createGeneralBillPricingServiceValidation(input);
    const created = await createGeneralBillPricingInDb(input);

    logger.info("exiting::createGeneralBillPricing::service");
    return Promise.all(
      created.map((generalBillPricing) =>
        toGeneralBillPricingDTO(generalBillPricing),
      ),
    );
  },

  async updateGeneralBillPricing(
    input: UpdateGeneralBillPricingInput,
  ): Promise<GeneralBillPricingDTO> {
    logger.info("entering::updateGeneralBillPricing::service");

    await updateGeneralBillPricingServiceValidation(input);

    const updated = await updateGeneralBillPricingInDb(input);

    logger.info("exiting::updateGeneralBillPricing::service");
    return toGeneralBillPricingDTO(updated);
  },

  async getGeneralBillPricingById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<GeneralBillPricingDTO | null> {
    logger.info("entering::getGeneralBillPricingById::service");

    validIdCheck(id);

    const generalBillPricing = await getGeneralBillPricingByIdFromDb(id);

    if (!generalBillPricing) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "General Bill Pricing"),
        );
      }
      return null;
    }

    logger.info("exiting::getGeneralBillPricingById::service");
    return toGeneralBillPricingDTO(generalBillPricing);
  },

  async buildExcelGeneralBillPricingMap() {
    logger.info("entering::buildExcelGeneralBillPricingMap::service");

    const generalBillItems =
      await generalBillItemService.getAllGeneralBillItem();
    if (!generalBillItems || generalBillItems.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "General Bill Item"),
      );
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("General Bill Pricing Map");

    const headers = [
      "General Bill Item ID",
      "General Bill Item Name",
      "Price",
      "Description",
    ];

    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "left" };

    generalBillItems.forEach((item) => {
      const row = ws.addRow([
        item.id,
        item.name,
        item.defaultPrice,
        item.description ?? "",
      ]);
      row.alignment = { horizontal: "left" };
    });

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    const lockedCols = [1, 2, 3, 4];
    ws.eachRow({ includeEmpty: true }, (row, r) => {
      row.eachCell({ includeEmpty: true }, (cell, c) => {
        cell.protection =
          lockedCols.includes(c) || r === 1
            ? { locked: true }
            : { locked: false };
      });
    });

    await ws.protect("", {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    logger.info("exiting::buildExcelGeneralBillPricingMap::service");
    return wb;
  },

  async generalBillPricingMapExcelImport(input: GeneralBillPricingExcelInput) {
    logger.info("entering::generalBillPricingMapExcelImport::service");

    const { ccId, filePath } = input;

    if (!filePath) {
      throw new Error("No file path provided for Excel import");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<GeneralBillPricingExcelRow>(sheet);

    if (!data || data.length === 0) {
      throw new ErrorHandler(400, "Excel file is empty or invalid.");
    }

    const convertedData = data.map((row) =>
      mapRowToGeneralBillPricingExcelCreateInput(row, ccId),
    );

    const batch = await CreateGeneralBillPricingExcelInDb(convertedData);

    generalBillPricingBatchJob(batch.id)
      .then(() =>
        logger.info("General Bill Pricing Batch Processing Completed."),
      )
      .catch((e) => logger.error(JSON.stringify(e)));

    logger.info("exiting::generalBillPricingMapExcelImport::service");
  },

  async copyGeneralBillPricing(input: CopyGeneralBillPricing) {
    logger.info("entering::copyGeneralBillPricing::service");

    await copyGeneralBillPricingServiceValidation(input);
    const { fromId, toId } = input;

    const fromItems = await getGeneralBillPricingByCcIdFromDb(fromId);
    if (!fromItems || fromItems.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage(
          "NOT_FOUND",
          "General Bill Pricing for source Collection Center",
        ),
      );
    }

    const toItems = await getGeneralBillPricingByCcIdFromDb(toId);

    await copyGeneralBillPricingInDb({
      fromItems,
      toItems: toItems ?? [],
      toId,
    });

    logger.info("exiting::copyGeneralBillPricing::service");
  },

  async getGeneralBillPricingWithItemByCcId(
    input: GeneralBillPricingSearchInput,
  ): Promise<GeneralBillPricingWithItemDTO[]> {
    logger.info("entering::getGeneralBillPricingWithItemByCcId::service");

    const { ccId, searchText } = input;

    const pricingRows = await searchGeneralBillPricingByCcIdFromDb(
      ccId,
      searchText,
    );

    const dtoList = await toGeneralBillPricingWithItemDTO(pricingRows);

    logger.info("exiting::getGeneralBillPricingWithItemByCcId::service");
    return dtoList;
  },
};
