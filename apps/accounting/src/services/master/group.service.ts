import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { mapRowToGroupExcelCreateInput } from "@/mapper/master/group.mapper.js";
import {
  createGroupExcelInDb,
  deleteGroupFromDb,
  groupExcelBatchJob,
} from "@/repository/master/group.repository.js";

import { validateDeleteGroupServiceValidation } from "@/validations/service/master/group.service.validation.js";
import { deleteCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";

const cacheKey = getRedisKey("GROUP", "all");

const groupServiceRaw = {
  async deleteGroup(id: number) {
    logger.info("entering::deleteGroup::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.GROUP);
    await validateDeleteGroupServiceValidation(id);
    await deleteGroupFromDb(id);

    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteGroup::service");
  },

  async createGroupExcel(params: { filePath: string; companyId: number }) {
    logger.info("entering::createGroupExcel::service");
    const { filePath, companyId } = params;

    await createGroupExcelServiceValidation({ companyId, filePath });

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
    }) as GroupExcelRow[];

    if (data.length === 0) {
      throw new ErrorHandler(400, "Excel file is empty");
    }

    const convertedData = data.map((row, index) =>
      mapRowToGroupExcelCreateInput(row, index + 1)
    );
    const batch = await createGroupExcelInDb(convertedData);

    groupExcelBatchJob({ batchJobId: batch.id, companyId })
      .then(() => logger.info("Group Excel Batch Processing Completed"))
      .catch((error) => logger.error(JSON.stringify(error)));

    logger.info("exiting::createGroupExcel::service");
  },

  async buildExcelForGroupExport() {
    logger.info("entering::buildExcelForGroupExport::service");

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("GROUP");

    const headerAttributes: HeaderAttribute[] = [
      { text: "Name", color: "FF0000" },
      { text: "Alias" },
      { text: "Is Primary Group", color: "FF0000" },
      { text: "Parent Group Name" },
      {
        text: "Primary Category",
        color: "FF0000",
        enumValues: [...PRIMARY_CATEGORIES],
      },
      {
        text: "Report Type",
        color: "FF0000",
        enumValues: [...REPORT_TYPES],
      },
      {
        text: "Nature",
        color: "FF0000",
        enumValues: [...NATURES],
      },
      { text: "Affects Gross Profit" },
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

    const sampleRows = buildGroupExcelSampleRows();
    for (const sampleRowData of sampleRows) {
      const sampleRow = ws.addRow(
        headerAttributes.map((header) => sampleRowData[header.text] ?? "")
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

    logger.info("exiting::buildExcelForGroupExport::service");

    return { excel: wb };
  },
};

export const groupService = auditProxy.createAuditedService(
  "group",
  groupServiceRaw
);
