import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  mapRowToLedgerExcelCreateInput,
  toFetchLedgerForExternalMappingDto,
} from "@/mapper/master/ledger.mapper.js";
import {
  createLedgerExcelInDb,
  createLedgerInDb,
  deleteLedgerFromDb,
  ledgerExcelBatchJob,
  patchLedgerInDb,
  updateLedgerInDb,
} from "@/repository/master/ledger.repository.js";
import {
  CreateOrUpdateLedgerInput,
  FetchLedgerForExternalMappingInput,
  LedgerExcelRow,
} from "@/types/master/ledger.js";
import { HeaderAttribute } from "@/types/voucher/voucher.js";
import {
  buildLedgerExcelSampleRows,
  GST_TYPES,
  LEDGER_TYPES,
} from "@/utils/groupAndLedgerExcelImport.utils.js";

import {
  createLedgerExcelServiceValidation,
  createOrUpdateLedgerServiceValidation,
  patchLedgerServiceValidation,
  validateDeleteLedgerServiceValidation,
} from "@/validations/service/master/ledger.service.validation.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";
import { stateService } from "@apps/core/services/master/state.service.js";
import {
  addToCache,
  deleteCache,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";

const cacheKey = getRedisKey("LEDGER", "all");

const ledgerServiceRaw = {
  async createLedger(input: CreateOrUpdateLedgerInput) {
    logger.info("entering::createLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await createOrUpdateLedgerServiceValidation(input);
    const createdLedger = await createLedgerInDb(input);
    if (isCacheable && createdLedger) {
      await addToCache(cacheKey, createdLedger.id, createdLedger);
    }
    logger.info("exiting::createLedger::service");
    return createdLedger;
  },
  async updateLedger(input: CreateOrUpdateLedgerInput) {
    logger.info("entering::updateLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await createOrUpdateLedgerServiceValidation(input);
    const updatedLedger = await updateLedgerInDb(input);
    if (isCacheable && updatedLedger) {
      await updateCache(cacheKey, updatedLedger.id, updatedLedger);
    }
    logger.info("exiting::updateLedger::service");
    return updatedLedger;
  },
  async patchLedger(
    input: Pick<
      CreateOrUpdateLedgerInput,
      "id" | "currencyId" | "creditPeriodInDays"
    >,
  ) {
    logger.info("entering::patchLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await patchLedgerServiceValidation(input);
    const patchedLedger = await patchLedgerInDb(input);
    if (isCacheable && patchedLedger) {
      await updateCache(cacheKey, patchedLedger.id, patchedLedger);
    }
    logger.info("exiting::patchLedger::service");
    return patchedLedger;
  },
  async deleteLedger(id: number) {
    logger.info("entering::deleteLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await validateDeleteLedgerServiceValidation(id);
    const deletedLedger = await deleteLedgerFromDb(id);
    if (isCacheable && deletedLedger) {
      await deleteCache(cacheKey, deletedLedger.id);
    }
    logger.info("exiting::deleteLedger::service");
  },
  async fetchLedgerForExternalMapping(
    input: FetchLedgerForExternalMappingInput,
  ) {
    logger.info("entering::fetchLedgerForExternalMapping::service");
    const ledgers = await toFetchLedgerForExternalMappingDto(input);
    logger.info("exiting::fetchLedgerForExternalMapping::service");
    return ledgers;
  },

  async createLedgerExcel(params: { filePath: string; companyId: number }) {
    logger.info("entering::createLedgerExcel::service");
    const { filePath, companyId } = params;

    await createLedgerExcelServiceValidation({ companyId, filePath });

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
    }) as LedgerExcelRow[];

    if (data.length === 0) {
      throw new ErrorHandler(400, "Excel file is empty");
    }

    const convertedData = data.map((row, index) =>
      mapRowToLedgerExcelCreateInput(row, index + 1),
    );
    const batch = await createLedgerExcelInDb(convertedData);

    ledgerExcelBatchJob({ batchJobId: batch.id, companyId })
      .then(() => logger.info("Ledger Excel Batch Processing Completed"))
      .catch((error) => logger.error(JSON.stringify(error)));

    logger.info("exiting::createLedgerExcel::service");
  },

  async buildExcelForLedgerExport() {
    logger.info("entering::buildExcelForLedgerExport::service");

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("LEDGER");

    const states: string[] = (await stateService.getAllStates()).map(
      (state) => state.name,
    );
    const currencies: string[] = (await currencyService.getAllCurrency()).map(
      (currency) => currency.code,
    );

    const headerAttributes: HeaderAttribute[] = [
      { text: "Name", color: "FF0000" },
      { text: "Group Name", color: "FF0000" },
      { text: "Alias" },
      { text: "Ledger Type", enumValues: [...LEDGER_TYPES] },
      { text: "Bank Account" },
      { text: "Cash Account" },
      { text: "Bank Name" },
      { text: "Bank IFSC" },
      { text: "Bank Account No" },
      { text: "UPI Id" },
      { text: "Contact Name" },
      { text: "Phone" },
      { text: "Email" },
      { text: "Address" },
      { text: "TIN Type", enumValues: [...GST_TYPES] },
      { text: "TIN Number" },
      { text: "Place of Supply State", enumValues: states },
      { text: "Currency Code", enumValues: currencies },
    ];

    const headerRow = ws.addRow(headerAttributes.map((header) => header.text));
    headerRow.eachCell((cell, colNumber) => {
      const header = headerAttributes[colNumber - 1];
      cell.font = {
        bold: true,
        color: {
          argb: header.color
            ? header.color.startsWith("FF")
              ? header.color
              : `FF${header.color}`
            : "FF000000",
        },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFD9D9D9",
        },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    const sampleRows = buildLedgerExcelSampleRows();
    for (const sampleRowData of sampleRows) {
      const sampleRow = ws.addRow(
        headerAttributes.map((header) => sampleRowData[header.text] ?? ""),
      );

      sampleRow.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      });
    }

    headerAttributes.forEach((header, index) => {
      if (!header.enumValues?.length) return;

      const columnNumber = index + 1;

      for (let row = 2; row <= 50; row++) {
        ws.getCell(row, columnNumber).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${header.enumValues.join(",")}"`],
          showErrorMessage: true,
        };
      }
    });

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::buildExcelForLedgerExport::service");

    return { excel: wb };
  },
};
export const ledgerService = auditProxy.createAuditedService(
  "ledger",
  ledgerServiceRaw,
);
