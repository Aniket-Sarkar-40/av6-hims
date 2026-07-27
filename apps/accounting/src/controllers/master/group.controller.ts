import { groupService } from "@/services/master/group.service.js";
import { GroupExcelBaseInput } from "@/types/master/group.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const deleteGroup = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteGroup::controller");
  const { id } = req.query;
  await groupService.deleteGroup(Number(id));
  const response = BaseResponse.success({ type: "DELETED" }, "Group");
  logger.info("exiting::deleteGroup::controller");
  return res.status(200).json(response);
});

export const createGroupExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createGroupExcelImport::controller");
    const { companyId } = req.body as GroupExcelBaseInput;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    await groupService.createGroupExcel({
      filePath: req.file.path,
      companyId,
    });

    deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "Group Excel Import started.",
    });

    logger.info("exiting::createGroupExcelImport::controller");
    return res.status(200).json(response);
  },
);

export const exportGroupExcel = TryCatch(
  async (_req: Request, res: Response) => {
    logger.info("entering::exportGroupExcel::controller");

    const data = await groupService.buildExcelForGroupExport();

    const wb: Workbook = data.excel;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="group_sample_excel.xlsx"`,
    );

    await wb.xlsx.write(res);
    res.end();

    logger.info("exiting::exportGroupExcel::controller");
  },
);
