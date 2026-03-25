// import { toCompanyFromExcel } from "@/mapper/company.mapper.js";
import { REDIS_PREFIX } from "@/config/index.js";
import { CommonApproveReq, GetMyApprovalFlow, StartFlowReq } from "@/core/approval/approval.types.js";
import { approvalService } from "@/core/events/eventBus.js";
import db from "@/db/client.js";
import { dtoMapping } from "@/mapper/dtoMapping.js";
import { getInstance } from "@/repository/approval/approval.repository.js";
import {
  commonDelete,
  commonDropdownSearch,
  commonExcelExport,
  commonExcelImport,
  // commonExcelExport,
  // commonExcelImport,
  commonFetch,
  commonSearch,
  fixedSearch,
  fixedSearchWoPagination,
} from "@/repository/common.repository.js";
import {
  CommonExcelRequest,
  DeleteParams,
  DropdownRequestService,
  ExportExcelRequestService,
  // ExportExcelRequestService,
  FetchRequest,
  ImportExcelRequestService,
  // ImportExcelRequestService,
  NewFixedSearchRequestService,
  SearchRequestService,
  updateStatusParams,
} from "@/types/common.js";
import ErrorHandler from "@/utils/errorHandler.utils.js";
import { getDynamicValue, objectTo2DArray, toRelativeImageUrl } from "@/utils/helper.utils.js";
import { logger } from "@/utils/logger.utils.js";
import { deleteCache, getCacheById, updateCache } from "@/utils/redisHelper.utils.js";
import { generateErrorMessage } from "@/utils/responseMessage.utils.js";
import {
  commonDeleteValidation,
  commonShortCodeServiceValidation,
} from "@/validations/service/common.service.validation.js";
import type { AxiosResponse } from "axios";
import axios from "axios";
import ExcelJs from "exceljs";
import type { Readable } from "stream";
export const commonService = {
  async search(searchParams: SearchRequestService) {
    logger.info("entering::search::service");
    const commonData = await commonSearch(searchParams);

    logger.info("exiting::search::service");
    return commonData;
  },
  async dropdownSearch(searchParams: DropdownRequestService) {
    logger.info("entering::search::service");
    const commonData = await commonDropdownSearch(searchParams);

    logger.info("exiting::search::service");
    return commonData;
  },
  async fixedSearch(searchParams: NewFixedSearchRequestService) {
    logger.info("entering::fixedSearch::service");
    const commonData = await fixedSearch(searchParams);
    logger.info("exiting::fixedSearch::service");
    return commonData;
  },
  async fixedSearchWoPaginationService(searchParams: Omit<NewFixedSearchRequestService, "pageNo" | "pageSize">) {
    logger.info("entering::fixedSearchWoPaginationService::service");
    const commonData = await fixedSearchWoPagination(searchParams);
    logger.info("exiting::fixedSearchWoPaginationService::service");
    return commonData;
  },

  async commonExcelService(searchParams: CommonExcelRequest) {
    logger.info("entering::commonExcelService::service");
    const commonData = await fixedSearchWoPagination(searchParams);

    if (commonData.totalRecords === 0) {
      throw new ErrorHandler(404, generateErrorMessage("EXCEL"));
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet(`${searchParams.sheetName}`);

    ws.properties.defaultRowHeight = 18;

    if (searchParams.type === "NORMAL") {
      const headers = searchParams.config.map((config) => config.label);
      ws.addRow(headers).font = { bold: true };

      for (const element of commonData.data) {
        const row = searchParams.config.map((config) => {
          const value = getDynamicValue(element, config.accessorKey);
          return value === null || value === undefined ? "" : value;
        });
        ws.addRow(row);
      }
    } else if (
      searchParams.type === "GROUPED" &&
      searchParams.detailAccessorKey &&
      searchParams.headerAccessorKey &&
      searchParams.detailedConfig
    ) {
      let rowIndex = 1;
      for (const element of commonData.data) {
        const detailsList = getDynamicValue(element, searchParams.detailAccessorKey);
        ws.mergeCells(rowIndex, 1, rowIndex, searchParams.detailedConfig.length);
        const title = getDynamicValue(element, searchParams.headerAccessorKey);
        ws.getCell(rowIndex, 1).value = `${searchParams.shortCodeData.shortCode}-#${title}`;
        ws.getCell(rowIndex, 1).font = { bold: true };
        rowIndex++;

        const colLen = searchParams.detailedConfig.length;

        const detail = searchParams.config?.reduce(
          (acc, curr) => ({ ...acc, [curr.label]: getDynamicValue(element, curr.accessorKey) }),
          {}
        );

        const detailsArr = objectTo2DArray(detail, colLen % 2 === 0 ? colLen : colLen + 1);
        const oddCols = [];
        for (let i = 1; i <= colLen; i++) {
          if (i % 2 !== 0) oddCols.push(i);
        }

        for (const element of detailsArr) {
          const row = ws.addRow(element);
          oddCols.forEach((i) => (row.getCell(i).font = { bold: true, color: { argb: "666161" } }));
          rowIndex++;
        }

        if (!detailsList.length) {
          ws.addRow(["No items here."]);
          rowIndex++;
          continue;
        }

        const headers = searchParams.detailedConfig.map((config) => config.label);

        ws.addRow(headers).font = { bold: true };

        for (const element of detailsList) {
          const row = searchParams.detailedConfig.map((config) => {
            const value = getDynamicValue(element, config.accessorKey);
            return value === null || value === undefined ? "" : value;
          });
          ws.addRow(row);
          rowIndex++;
        }
        rowIndex++;
        rowIndex++;
      }
    }

    ws.columns?.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::commonExcelService::service");

    return wb;
  },

  async fetch(fetchParams: FetchRequest) {
    logger.info("entering::fetch::service");

    const shortCodeData = await commonShortCodeServiceValidation(fetchParams.shortCode, fetchParams.id);

    let commonData;

    if (shortCodeData.isCacheable && fetchParams.shortCode !== "UIN_CONFIG") {
      commonData = await getCacheById(`${REDIS_PREFIX}pms:${shortCodeData.tableName}:all`, fetchParams.id);
      if (commonData) {
        logger.info(`Cache hit for ${shortCodeData.tableName} ID: ` + fetchParams.id);
      } else {
        logger.error(
          `Cache hit but not found in cache for short code: ${shortCodeData.shortCode} and id: ${fetchParams.id}`
        );
      }
    } else {
      commonData = await commonFetch({ ...fetchParams, shortCodeData });
    }

    if (!commonData) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `${shortCodeData.tableName}`));
    }

    if (shortCodeData.isDTO && dtoMapping[shortCodeData.shortCode]) {
      const DtoResult = await dtoMapping[shortCodeData.shortCode](commonData);
      return DtoResult;
    }
    logger.info("exiting::fetch::service");
    return commonData;
  },

  async commonExcelImport(searchParams: ImportExcelRequestService) {
    logger.info("entering::commonExcelImport::service");

    const absolutePath = searchParams.file?.path;
    if (!absolutePath) {
      throw new Error("No file path provided for Excel import");
    }

    // 1. Load workbook
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(absolutePath);

    // 2. Grab the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No worksheet found in Excel file");
    }

    // 3. Extract header names from the first row
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.text?.trim();
      if (val) headers.push(val);
    });

    // 4. Build JSON rows
    const rawData: unknown[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // skip header
      if (rowNumber === 1) return;

      const rowObj: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        // ExcelJS row.values is 1-based
        const cellValue = row.getCell(idx + 1).value;
        // normalize empty → null
        rowObj[header] = cellValue === null || cellValue === undefined ? null : cellValue;
      });
      rawData.push(rowObj);
    });

    // 5. Delegate to your existing import routine
    const commonData = await commonExcelImport({
      ...searchParams,
      data: rawData,
    });

    logger.info("exiting::commonExcelImport::service");
    return commonData;
  },

  async commonExcelExport(exportParams: ExportExcelRequestService): Promise<ExcelJs.Workbook> {
    logger.info("entering::commonExcelExport::service");

    const excelData = await commonExcelExport(exportParams);

    if (!Array.isArray(excelData)) {
      throw new Error("Invalid data format: excelData must be an array of objects.");
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet(`${exportParams.shortCodeData.tableName}`);

    ws.properties.defaultRowHeight = 18;

    const headers = Object.keys(excelData[0]);
    ws.addRow(headers).font = { bold: true };

    for (const element of excelData) {
      ws.addRow(Object.values(element));
    }

    ws.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    logger.info("exiting::commonExcelExport::service");
    return wb;
  },

  async delete(deleteParams: DeleteParams) {
    logger.info("entering::delete::service");

    const shortCodeData = await commonDeleteValidation(deleteParams.shortCode, deleteParams.id);

    await commonDelete({ ...deleteParams, shortCodeData });

    if (shortCodeData.isCacheable) {
      await deleteCache(`${REDIS_PREFIX}pms:${shortCodeData.tableName}:all`, deleteParams.id);
    }

    logger.info("exiting::delete::service");
  },

  async updateStatus(updateStatusParams: updateStatusParams) {
    logger.info("entering::updateStatus::service");

    const shortCodeData = await commonShortCodeServiceValidation(updateStatusParams.shortCode, updateStatusParams.id);

    const updatedData = await commonDelete({
      ...updateStatusParams,
      shortCodeData,
    });

    if (shortCodeData.isCacheable) {
      await updateCache(`${REDIS_PREFIX}pms:${shortCodeData.tableName}:all`, updateStatusParams.id, updatedData);
    }

    logger.info("exiting::updateStatus::service");

    return updatedData;
  },

  async approve(input: CommonApproveReq) {
    logger.info("entering::approve::service");

    const instance = await getInstance(input.id, input.subjectType, input.service);

    await approvalService.act({
      instanceId: instance.id,
      approverId: input.approverId,
      action: input.approveType,
      ccId: input.ccId,
      comment: input.comment,
    });

    // Here you would typically call the approval repository method
    // to handle the approval logic, e.g., approvalRepository.approve(approvalData);

    logger.info("exiting::approve::service");
  },
  async fetchImageStream(fileName: string): Promise<AxiosResponse<Readable>> {
    const url = toRelativeImageUrl(fileName);
    return axios.get<Readable>(url, { responseType: "stream" });
  },

  async getStaffPendingApproval(input: GetMyApprovalFlow) {
    logger.info("entering::getStaffPendingApproval::service");

    const pendingApprovalInst = await approvalService.getAllApprovalFlow(input);

    pendingApprovalInst.data = pendingApprovalInst.data.map((inst) => ({
      ...inst,
      netTotal: Number(inst.netTotal),
      extra: inst.extra ? JSON.parse(inst.extra) : null,
    }));

    logger.info("exiting::getStaffPendingApproval::service");
    return pendingApprovalInst;
  },

  async startFlow(input: StartFlowReq) {
    logger.info("entering::startFlow::service");

    await approvalService.startFlow(db, input);

    logger.info("exiting::startFlow::service");
  },
};
