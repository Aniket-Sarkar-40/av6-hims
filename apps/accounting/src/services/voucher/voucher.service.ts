import { auditProxy } from "@/config/audit.config.js";
import {
  mapRowToVoucherExcelCreateInput,
  toVoucherDTO,
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
  VoucherLineDTO,
} from "@/types/voucher/voucher.js";
import {
  cancelVoucherServiceValidation,
  createOrUpdateVoucherServiceValidation,
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
const voucherServiceRaw = {
  async createVoucher(input: CreateOrUpdateVoucherInput) {
    logger.info("entering::createVoucher::service");
    await createOrUpdateVoucherServiceValidation(input);
    const voucher = await createVoucherInDb(input);
    logger.info("exiting::createVoucher::service");
    return voucher;
  },
  async updateVoucher(input: CreateOrUpdateVoucherInput) {
    logger.info("entering::updateVoucher::service");
    await createOrUpdateVoucherServiceValidation(input);
    const voucher = await updateVoucherInDb(input);
    logger.info("exiting::updateVoucher::service");
    return voucher;
  },
  async postExternalVoucher(input: ExternalPostVoucherInput) {
    logger.info("entering::postExternalVoucher::service");
    const voucherData = await prepareExternalVoucherPostInput(input);
    if (voucherData.length) {
      for (const voucher of voucherData) {
        await this.createVoucher({
          ...voucher,
        } as CreateOrUpdateVoucherInput);
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
    if (!filePath) {
      throw new Error("No file path provided");
    }

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
      mapRowToVoucherExcelCreateInput(row, index + 1, ledgerMeta)
    );

    // Save to DB
    const batch = await createVoucherExcelInDb(convertedData);

    // Trigger batch job (async)
    voucherExcelBatchJob({ batchJobId: batch.id, voucherTypeId, ccId })
      .then(() => logger.info("Voucher Entry Excel Batch Processing Completed"))
      .catch((e) => logger.error(JSON.stringify(e)));
    logger.info("exiting::createVoucherExcel::service");
  },

  async buildPdfForVoucherInvoice(
    voucherId: number
  ): Promise<{ pdf: Buffer; voucherNo: string | number | null }> {
    logger.info("entering::buildPdfForVoucherInvoice::service");

    const voucherData = await getVoucherDetailsForInvoice(voucherId);
    if (!voucherData) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Voucher"));
    }

    const voucherDto = await toVoucherDTO([voucherData]);
    const data = voucherDto[0];

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const FONT_NORMAL = "Helvetica";
    const FONT_BOLD = "Helvetica-Bold";

    const PAGE_LEFT = 30;
    const PAGE_WIDTH = doc.page.width - 60;
    const PAGE_BOTTOM = doc.page.height - 30;

    const ROW_H = 20;
    const FONT_SIZE = 9;

    const conversionRate = data.currencyConversionRate;

    let y = 30;

    const val = (v: unknown): string =>
      v === null || v === undefined || v === "" ? "-" : String(v);
    const fmtDate = (d: unknown): string =>
      d ? dayjs(d as string | Date).format("DD-MM-YYYY") : "-";
    const fmtAmt = (v: unknown): string => {
      const n = Number(v);
      const rate = Number(conversionRate);

      if (v === null || v === undefined || v === "" || isNaN(n)) {
        return "-";
      }

      if (
        conversionRate === null ||
        conversionRate === undefined ||
        isNaN(rate)
      ) {
        return n.toFixed(2);
      }

      if (rate === 0) {
        return "-";
      }

      return (n / rate).toFixed(2);
    };
    const fmtEnum = (v: unknown): string => val(v).replace(/_/g, " ");

    const drawHLine = (x: number, yw: number, w: number) => {
      doc
        .moveTo(x, yw)
        .lineTo(x + w, yw)
        .stroke("#000000");
    };
    const drawVLine = (xv: number, yt: number, h: number) => {
      doc
        .moveTo(xv, yt)
        .lineTo(xv, yt + h)
        .stroke("#000000");
    };

    const calcRowH = (
      text: string,
      w: number,
      fontSize: number = FONT_SIZE
    ): number => {
      const availW = w - 8;
      const lineH = fontSize * 1.4;
      const lines = Math.ceil(
        doc.font(FONT_NORMAL).fontSize(fontSize).widthOfString(text) / availW
      );
      return Math.max(ROW_H, lines * lineH + 8);
    };

    const writeCell = (
      text: string,
      x: number,
      yt: number,
      w: number,
      h: number,
      opts: {
        bold?: boolean;
        align?: "left" | "right" | "center";
        fontSize?: number;
        indent?: number;
        lineBreak?: boolean;
      } = {}
    ) => {
      const xOffset = opts.indent ?? 4;
      doc
        .font(opts.bold ? FONT_BOLD : FONT_NORMAL)
        .fontSize(opts.fontSize ?? FONT_SIZE)
        .fillColor("#000000")
        .text(String(text ?? ""), x + xOffset, yt + 5, {
          width: w - xOffset - 4,
          height: h - 5,
          align: opts.align ?? "left",
          ellipsis: !opts.lineBreak,
          lineBreak: opts.lineBreak ?? false,
        });
    };

    const TOTAL_W = PAGE_WIDTH;
    const metaColW = TOTAL_W / 3;

    // writeLabelValue: dynamically sizes label width based on actual text
    // so value always has room and never truncates
    const writeLabelValue = (
      label: string,
      value: string,
      x: number,
      rowY: number,
      colW: number
    ) => {
      const labelText = `${label}:`;
      const labelW =
        doc.font(FONT_BOLD).fontSize(FONT_SIZE).widthOfString(labelText) + 6;
      const valueX = x + labelW;
      const valueW = colW - labelW - 4;

      doc
        .font(FONT_BOLD)
        .fontSize(FONT_SIZE)
        .fillColor("#000000")
        .text(labelText, x + 2, rowY + 4, {
          width: labelW,
          height: ROW_H - 4,
          lineBreak: false,
          ellipsis: false,
        });
      doc
        .font(FONT_NORMAL)
        .fontSize(FONT_SIZE)
        .fillColor("#000000")
        .text(value, valueX, rowY + 4, {
          width: valueW,
          height: ROW_H - 4,
          lineBreak: false,
          ellipsis: false,
        });
    };

    const TOTAL_W_CONST = PAGE_WIDTH;

    // ── TITLE ──────────────────────────────────────────────
    const titleH = ROW_H + 10;
    writeCell("Voucher", PAGE_LEFT, y, TOTAL_W_CONST, titleH, {
      bold: true,
      fontSize: 16,
      align: "center",
    });
    y += titleH;

    doc
      .moveTo(PAGE_LEFT, y)
      .lineTo(PAGE_LEFT + TOTAL_W_CONST, y)
      .lineWidth(1.5)
      .stroke("#000000");
    doc.lineWidth(1);
    y += 12;

    // ── REFERENCE NO + DATE ROW ────────────────────────────
    doc
      .font(FONT_NORMAL)
      .fontSize(FONT_SIZE)
      .fillColor("#000000")
      .text("Reference No: ", PAGE_LEFT, y, { continued: true })
      .font(FONT_BOLD)
      .text(val(data.voucherNo), { continued: false });

    doc
      .font(FONT_NORMAL)
      .fontSize(FONT_SIZE)
      .fillColor("#000000")
      .text("Date: ", PAGE_LEFT + TOTAL_W_CONST - 120, y, {
        continued: true,
        width: 120,
      })
      .font(FONT_BOLD)
      .text(fmtDate(data.voucherDate), { continued: false });

    y += ROW_H + 4;

    // ── META INFO ──────────────────────────────────────────
    // Row 1
    writeLabelValue(
      "Voucher Type",
      val(data.voucherType?.value),
      PAGE_LEFT,
      y,
      metaColW
    );
    writeLabelValue(
      "Status",
      val(data.status),
      PAGE_LEFT + metaColW,
      y,
      metaColW
    );
    writeLabelValue(
      "Ref Type",
      fmtEnum(data.refType),
      PAGE_LEFT + metaColW * 2,
      y,
      metaColW
    );
    y += ROW_H;

    // Row 2
    writeLabelValue(
      "Sub Ref Type",
      fmtEnum(data.subRefType),
      PAGE_LEFT,
      y,
      metaColW
    );
    writeLabelValue(
      "Ref No",
      val(data.refNo),
      PAGE_LEFT + metaColW,
      y,
      metaColW
    );
    writeLabelValue(
      "Created By",
      val(data.createdBy?.value),
      PAGE_LEFT + metaColW * 2,
      y,
      metaColW
    );
    y += ROW_H;

    // Row 3
    writeLabelValue(
      "Created At",
      fmtDate(data.createdAt),
      PAGE_LEFT,
      y,
      metaColW
    );
    writeLabelValue(
      "Approved By",
      val(data.approvedBy?.value),
      PAGE_LEFT + metaColW,
      y,
      metaColW
    );
    writeLabelValue(
      "Approved At",
      fmtDate(data.approvedAt),
      PAGE_LEFT + metaColW * 2,
      y,
      metaColW
    );
    y += ROW_H;

    // Row 4
    writeLabelValue(
      "Currency",
      val(data.currency?.value ?? ""),
      PAGE_LEFT,
      y,
      metaColW
    );
    writeLabelValue(
      "Currency Conversion Rate",
      val(data.currencyConversionRate),
      PAGE_LEFT + metaColW,
      y,
      metaColW
    );
    writeLabelValue(
      "Total Debit",
      fmtAmt(data.totalDebit),
      PAGE_LEFT + metaColW * 2,
      y,
      metaColW
    );
    y += ROW_H;

    // Row 5
    writeLabelValue(
      "Total Credit",
      fmtAmt(data.totalCredit),
      PAGE_LEFT,
      y,
      metaColW
    );
    y += ROW_H;

    // Narration — full width wrapping
    const narration = val(data.narration);
    const narrationLabelText = "Narration:";
    const narrationLabelW =
      doc
        .font(FONT_BOLD)
        .fontSize(FONT_SIZE)
        .widthOfString(narrationLabelText) + 6;
    const narrationValueW = TOTAL_W_CONST - narrationLabelW - 4;
    const narrationH = calcRowH(narration, narrationValueW);

    doc
      .font(FONT_BOLD)
      .fontSize(FONT_SIZE)
      .fillColor("#000000")
      .text(narrationLabelText, PAGE_LEFT + 2, y + 4, {
        width: narrationLabelW,
        lineBreak: false,
      });
    doc
      .font(FONT_NORMAL)
      .fontSize(FONT_SIZE)
      .fillColor("#000000")
      .text(narration, PAGE_LEFT + narrationLabelW + 2, y + 4, {
        width: narrationValueW,
        lineBreak: true,
      });
    y += narrationH;
    y += 8;

    // ── VOUCHER LINES TABLE ────────────────────────────────
    const snW = TOTAL_W_CONST * 0.08;
    const ledW = TOTAL_W_CONST * 0.52;
    const drW = TOTAL_W_CONST * 0.2;
    const crW = TOTAL_W_CONST * 0.2;

    const snX = PAGE_LEFT;
    const ledX = snX + snW;
    const drX = ledX + ledW;
    const crX = drX + drW;

    const drawLinesBorder = (rowY: number, h: number = ROW_H) => {
      drawVLine(snX, rowY, h);
      drawVLine(ledX, rowY, h);
      drawVLine(drX, rowY, h);
      drawVLine(crX, rowY, h);
      drawVLine(crX + crW, rowY, h);
    };

    // Table header
    doc
      .rect(PAGE_LEFT, y, TOTAL_W_CONST, ROW_H)
      .fill("#f0f0f0")
      .stroke("#000000");
    doc.fillColor("#000000");
    drawHLine(PAGE_LEFT, y, TOTAL_W_CONST);
    drawLinesBorder(y);
    writeCell("SR NO", snX, y, snW, ROW_H, { bold: true, align: "center" });
    writeCell("LEDGER", ledX, y, ledW, ROW_H, { bold: true, align: "center" });
    writeCell("DR", drX, y, drW, ROW_H, { bold: true, align: "center" });
    writeCell("CR", crX, y, crW, ROW_H, { bold: true, align: "center" });
    drawHLine(PAGE_LEFT, y + ROW_H, TOTAL_W_CONST);
    y += ROW_H;

    // Table rows
    (data.voucherLines ?? []).forEach((line: VoucherLineDTO, idx: number) => {
      if (y + ROW_H > PAGE_BOTTOM) {
        doc.addPage();
        y = 30;
      }
      drawHLine(PAGE_LEFT, y, TOTAL_W_CONST);
      drawLinesBorder(y);
      writeCell(String(line.lineNo ?? idx + 1), snX, y, snW, ROW_H, {
        align: "center",
      });
      writeCell(val(line.ledger?.value), ledX, y, ledW, ROW_H);
      writeCell(
        line.drCr === "DR" ? fmtAmt(line.amount) : "-",
        drX,
        y,
        drW,
        ROW_H,
        { align: "right" }
      );
      writeCell(
        line.drCr === "CR" ? fmtAmt(line.amount) : "-",
        crX,
        y,
        crW,
        ROW_H,
        { align: "right" }
      );
      y += ROW_H;
    });

    // ── TOTALS ROW ─────────────────────────────────────────
    doc
      .rect(PAGE_LEFT, y, TOTAL_W_CONST, ROW_H)
      .fill("#f0f0f0")
      .stroke("#000000");
    doc.fillColor("#000000");
    drawHLine(PAGE_LEFT, y, TOTAL_W_CONST);
    drawLinesBorder(y);
    writeCell("Total", snX, y, snW + ledW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(data.totalDebit), drX, y, drW, ROW_H, {
      bold: true,
      align: "right",
    });
    writeCell(fmtAmt(data.totalCredit), crX, y, crW, ROW_H, {
      bold: true,
      align: "right",
    });
    drawHLine(PAGE_LEFT, y + ROW_H, TOTAL_W_CONST);
    y += ROW_H;

    doc.end();
    return new Promise((resolve) => {
      doc.on("end", () =>
        resolve({
          pdf: Buffer.concat(chunks),
          voucherNo: data.voucherNo ?? null,
        })
      );
    });
  },
};

export const voucherService = auditProxy.createAuditedService(
  "ledger",
  voucherServiceRaw
);
