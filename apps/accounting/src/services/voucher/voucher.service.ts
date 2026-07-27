import { auditProxy } from "@/config/audit.config.js";
import {
  mapRowToVoucherExcelCreateInput,
  toVoucherDTO,
  toVoucherJournalPdfDTO,
  toVoucherPdfDTO,
} from "@/mapper/voucher/voucher.mapper.js";
import {
  createVoucherExcelInDb,
  voucherExcelBatchJob,
} from "@/repository/batch/batch.repository.js";
import {
  cancelVoucherInDb,
  createVoucherInDb,
  deleteVoucherFromDb,
  getVoucherDetailsForInvoice,
  updateVoucherInDb,
} from "@/repository/voucher/voucher.repository.js";
import { VoucherEntryExcelRow } from "@/types/batch/batch.js";
import {
  CreateOrUpdateVoucherInput,
  ExternalPostVoucherInput,
  HeaderAttribute,
  VoucherLineDTO,
  VoucherStatusForExcel,
} from "@/types/voucher/voucher.js";
import {
  cancelVoucherServiceValidation,
  createOrUpdateVoucherServiceValidation,
  createVoucherFromExcelServiceValidation,
  deleteVoucherServiceValidation,
} from "@/validations/service/voucher/voucher.service.validation.js";
import XLSX from "xlsx";

import PDFDocument from "pdfkit";
import dayjs from "dayjs";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { prepareExternalVoucherPostInput } from "@/utils/externalVoucherPost.utils.js";
import {
  getLedgerColumnMeta,
  validateVoucherExcelHeaders,
} from "@/utils/voucherExcelImport.utils.js";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";
import { pdfTemplateService } from "@apps/core/services/pdf/pdfTemplate.service.js";
import { validateIdVoucherType } from "@/validations/service/master/voucherType.service.validation.js";
import ExcelJs from "exceljs";
import { BankTransactionType, DrCr } from "@repo/db/generated/prisma/enums.js";
import { buildVoucherExcelSampleRow } from "@/utils/voucherExcelSampleExport.utils.js";
import { resolvePdfTemplate } from "@/utils/applyTemplate.utils.js";
import { generateVoucherInvoice } from "@/utils/voucherPdf.utils.js";
import { convertDatesToYMD } from "@repo/shared/utils/date.utils.js";

const voucherServiceRaw = {
  async createVoucher(
    input: CreateOrUpdateVoucherInput,
    isCurrencyConversionRequired: boolean = true,
  ) {
    logger.info("entering::createVoucher::service");
    await createOrUpdateVoucherServiceValidation({
      input,
      isCurrencyConversionRequired,
    });
    const voucher = await createVoucherInDb(input);
    logger.info("exiting::createVoucher::service");
    return voucher;
  },
  async updateVoucher(input: CreateOrUpdateVoucherInput) {
    logger.info("entering::updateVoucher::service");
    await createOrUpdateVoucherServiceValidation({ input });
    const voucher = await updateVoucherInDb(input);
    logger.info("exiting::updateVoucher::service");
    return voucher;
  },
  async postExternalVoucher(input: ExternalPostVoucherInput) {
    logger.info("entering::postExternalVoucher::service");
    const { preparedVoucherInputs, isCurrencyConversionRequired } =
      await prepareExternalVoucherPostInput(input);
    if (preparedVoucherInputs.length) {
      for (const voucher of preparedVoucherInputs) {
        await this.createVoucher(
          { ...voucher } as CreateOrUpdateVoucherInput,
          isCurrencyConversionRequired,
        );
      }
    }
    logger.info("exiting::postExternalVoucher::service");
  },
  async deleteVoucher(id: number) {
    logger.info("entering::deleteVoucher::service");
    await deleteVoucherServiceValidation(id);
    await deleteVoucherFromDb(id);
    logger.info("exiting::deleteVoucher::service");
  },
  async cancelVoucher(id: number) {
    logger.info("entering::cancelVoucher::service");
    await cancelVoucherServiceValidation(id);
    await cancelVoucherInDb(id);
    logger.info("exiting::cancelVoucher::service");
  },

  async createVoucherExcel(params: {
    filePath: string;
    ccId: number;
    voucherTypeId: number;
  }) {
    logger.info("entering::createVoucherExcel::service");
    const { filePath, ccId, voucherTypeId } = params;
    await createVoucherFromExcelServiceValidation({
      filePath,
      ccId,
      voucherTypeId,
    });
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
    }) as VoucherEntryExcelRow[];

    if (data.length === 0) {
      throw new ErrorHandler(400, "Excel file is empty");
    }

    // Validate headers (only first row)
    validateVoucherExcelHeaders(data[0]);

    // Detect ledger columns ONCE
    const ledgerMeta = getLedgerColumnMeta(data[0]);

    // Convert rows
    const convertedData = data.map((row, index) =>
      mapRowToVoucherExcelCreateInput(row, index + 1, ledgerMeta),
    );

    // Save to DB
    const batch = await createVoucherExcelInDb(convertedData);

    // Trigger batch job (async)
    voucherExcelBatchJob({ batchJobId: batch.id, voucherTypeId, ccId })
      .then(() => logger.info("Voucher Entry Excel Batch Processing Completed"))
      .catch((e) => logger.error(JSON.stringify(e)));
    logger.info("exiting::createVoucherExcel::service");
  },

  async buildExcelForVoucherExport(voucherTypeId: number) {
    logger.info("entering::buildExcelForVoucherExport::service");

    const voucherType = await validateIdVoucherType(voucherTypeId);
    const name = voucherType.name.toUpperCase();

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet(`${name}`);

    let headerAttributes: HeaderAttribute[] = [];

    switch (name) {
      case "CONTRA":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            color: "FF0000",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 2 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 2 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 2 ? "FF0000" : undefined,
            },
            {
              text: `Ledger ${i} Dr/Cr`,
              color: i <= 2 ? "FF0000" : undefined,
              enumValues: Object.values(DrCr),
            },
          );
        }

        break;
      case "JOURNAL":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            color: "FF0000",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 2 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 2 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 2 ? "FF0000" : undefined,
            },
            {
              text: `Ledger ${i} Dr/Cr`,
              color: i <= 2 ? "FF0000" : undefined,
              enumValues: Object.values(DrCr),
            },
          );
        }
        break;
      case "SALES":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      case "PAYMENT":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
          { text: "Party Ledger Group", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      case "RECEIPT":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
          { text: "Party Ledger Group", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      case "PURCHASE":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      case "BANK PAYMENT":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
          { text: "Party Ledger Group", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
            {
              text: `Ledger ${i} Transaction Type`,
              color: i <= 1 ? "FF0000" : undefined,
              enumValues: Object.values(BankTransactionType),
            },
            {
              text: `Ledger ${i} Instrument No`,
              color: i <= 1 ? "FF0000" : undefined,
            },
            {
              text: `Ledger ${i} Instrument Date`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      case "CASH PAYMENT":
        headerAttributes = [
          { text: "Voucher Date", color: "FF0000" },
          { text: "Voucher Type", color: "FF0000" },
          { text: "Ref Type" },
          { text: "Sub Ref Type" },
          { text: "Ref No" },
          {
            text: "Status",
            enumValues: Object.values(VoucherStatusForExcel),
          },
          { text: "Narration", color: "FF0000" },
          { text: "Party Ledger", color: "FF0000" },
          { text: "Party Ledger Group", color: "FF0000" },
        ];

        for (let i = 1; i <= 10; i++) {
          headerAttributes.push(
            { text: `Ledger ${i}`, color: i <= 1 ? "FF0000" : undefined },
            { text: `Ledger ${i} Group`, color: i <= 1 ? "FF0000" : undefined },
            {
              text: `Ledger ${i} Amount`,
              color: i <= 1 ? "FF0000" : undefined,
            },
          );
        }
        break;
      default:
        throw new ErrorHandler(
          400,
          `Excel export is not configured for voucher type ${name.toLowerCase()}`,
        );
    }

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

    const sampleRowData = buildVoucherExcelSampleRow(voucherType.name);

    const sampleRow = ws.addRow(
      headerAttributes.map((header) => sampleRowData[header.text] ?? ""),
    );

    sampleRow.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });
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

    /* Auto size the columns */
    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::buildExcelForVoucherExport::service");

    return {
      excel: wb,
      name: voucherType.name,
    };
  },

  async buildPdfForVoucherInvoice(
    voucherId: number,
  ): Promise<{ pdf: Buffer; voucherNo: string | number | null }> {
    logger.info("entering::buildPdfForVoucherInvoice::service");

    const voucherData = await getVoucherDetailsForInvoice(voucherId);
    if (!voucherData) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Voucher"));
    }

    const voucherTypeId = voucherData.voucherTypeId;
    const voucherType = await validateIdVoucherType(voucherTypeId);

    let fileDef;

    if (voucherType.nature == "JOURNAL") {
      const voucherJournalDto = await toVoucherJournalPdfDTO(voucherData);
      const pdfTemplate =
        await pdfTemplateService.getPdfTemplateByModuleAndType({
          module: "ACCOUNTING",
          type: "JOURNAL_VOUCHER",
        });

      if (!pdfTemplate) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "PDF template"),
        );
      }

      fileDef = await resolvePdfTemplate(
        pdfTemplate.bodyJson as unknown as CustomDocDefinition,
        voucherJournalDto,
      );
    } else {
      const voucherDto = await toVoucherPdfDTO(voucherData);
      fileDef = await generateVoucherInvoice(convertDatesToYMD(voucherDto));
    }

    const pdfBuffer = await renderCustomPdfToBuffer(fileDef);

    return {
      pdf: pdfBuffer,
      voucherNo: voucherData.voucherNo,
    };
  },
};

export const voucherService = auditProxy.createAuditedService(
  "ledger",
  voucherServiceRaw,
);
