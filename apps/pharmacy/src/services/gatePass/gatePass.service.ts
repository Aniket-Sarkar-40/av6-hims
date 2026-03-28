import ExcelJs from "exceljs";
import { toGatePassDTO } from "@/mapper/gatePass/gatePass.mapper.js";
import {
  createGatePassInDb,
  deleteGatePassFromDb,
  getAllGatePassFromDb,
  getGatePassByFilterFromDb,
  getGatePassByIdFromDb,
  updateGatePassInDb,
} from "@/repository/gatePass/gatePass.repository.js";
import {
  CreateOrUpdateGatePassInput,
  GatePassDto,
  GatePassFilter,
} from "@/types/gatePass/gatePass.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createGatePassServiceValidation,
  updateGatePassServiceValidation,
  validateIdGatePass,
} from "@/validations/service/gatePass/gatePass.service.validation.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import dayjs from "dayjs";

export const gatePassService = {
  async createGatePass(input: CreateOrUpdateGatePassInput) {
    logger.info("entering::createGatePass::service");
    await createGatePassServiceValidation(input);
    const createGatePass = await createGatePassInDb(input);

    logger.info("exiting::createStore Requisition::service");
    return createGatePass;
  },

  async updateGatePass(input: CreateOrUpdateGatePassInput) {
    logger.info("entering::updateGatePass::service");

    await updateGatePassServiceValidation(input);

    const updatedPO = await updateGatePassInDb(input);

    logger.info("exiting::updateGatePass::service");
    return updatedPO;
  },

  async getAllGatePass() {
    logger.info("entering::getAllGatePass::service");

    const records = await getAllGatePassFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "gatePass Order"),
      );
    }

    const dto = await Promise.all(records.map(async (gp) => toGatePassDTO(gp)));

    logger.info("exiting::getAllGatePass::service");
    return dto;
  },

  async getGatePassById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<GatePassDto | null> {
    logger.info("entering::getGatePassById::service id=" + id);

    validIdCheck(id);

    const gatePass = await getGatePassByIdFromDb(id);

    if (!gatePass) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Gate Pass Note"),
        );
      } else {
        logger.warn(
          `gatePass with id=${id} not found, returning null as requested.`,
        );
        return null;
      }
    }

    const dto = await toGatePassDTO(gatePass);

    logger.info("exiting::getGatePassById::service id=" + id);
    return dto;
  },

  async deleteGatePass(id: number): Promise<void> {
    logger.info("entering::deleteGatePass::service id=" + id);

    await validateIdGatePass(id);

    await deleteGatePassFromDb(id);
    logger.info("exiting::deleteGatePass::service id=" + id);
  },

  async buildGatePassReportWorkbook(
    filter: GatePassFilter,
  ): Promise<ExcelJs.Workbook> {
    logger.info("entering::buildGatePassReportWorkbook::service");

    const rawList = await getGatePassByFilterFromDb(filter);
    if (!rawList || rawList.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Gate Pass"),
      );
    }

    const list: GatePassDto[] = await Promise.all(rawList.map(toGatePassDTO));

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Gate Pass Report");
    ws.properties.defaultRowHeight = 18;

    // ────── Header ──────
    const headers = [
      "ID",
      "Date",
      "Distributor",
      "Warehouse",
      "Total Qty",
      "PO Number",
      "PO Date",
      "Box Count",
      "Bill Amount",
      "Gate Pass No.",
      "Invoice No.",
      "Remarks",
      "Priority",
      "Status",
    ];
    const headerRow = ws.addRow(headers);
    headerRow.height = 18;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ────── Data Rows ──────
    for (const dto of list) {
      const row = ws.addRow([
        dto.id,
        dto.date instanceof Date
          ? dayjs(dto.date).format("YYYY-MM-DD")
          : dto.date,
        dto.distributor?.proInName ?? "",
        dto.warehouse?.name ?? "",
        dto.totalQuantity,
        dto.poNumber,
        dto.poDate ? dayjs(dto.poDate).format("YYYY-MM-DD") : "",
        dto.boxCount,
        dto.billAmount,
        dto.gatePassNumber,
        dto.invoiceNumber ?? "",
        dto.remarks ?? "",
        dto.priority ?? "",
        dto.status,
      ]);

      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
    }

    // ────── Auto‐fit Columns ──────
    ws.columns.forEach((col) => {
      let max = 10;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value != null ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
      }
      col.width = max + 2;
    });

    logger.info("exiting::buildGatePassReportWorkbook::service");
    return wb;
  },
};
