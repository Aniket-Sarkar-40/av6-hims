import { commonServiceFactory } from "@/config/core.config.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { shortCodeService } from "@/services/shortCode.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  CommonExcelRequest,
  DeleteParams,
  DropdownRequest,
  ExportExcel,
  FetchRequest,
  ImportExcel,
  NewFixedSearchRequest,
  SearchRequest,
  updateStatusParams,
} from "av6-core-v2";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import { OpdDynamicShortCode } from "@repo/db/generated/prisma/client";

export const fixedSearch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::fixedSearch::controller");
  const {
    pageNo = 1,
    pageSize = 10,
    shortCode,
    searchText,
    sortBy,
    sortDir,
    searchColumns = [],
    fixedNotSearch,
    fixedSearch,
    includes,
  } = req.body as NewFixedSearchRequest;
  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: "Short code not found.",
        errorCode: "NOT_FOUND",
        errorMessage: "Short code not found.",
      }),
    );
  }

  const searchData = await commonServiceFactory.fixedSearch({
    pageNo,
    pageSize,
    shortCode,
    searchText,
    searchColumns,
    sortBy,
    sortDir,
    shortCodeData,
    fixedSearch,
    fixedNotSearch,
    includes,
  });

  const response = new BaseResponse(
    { success: true, message: "Data fetched successfully." },
    searchData,
  );
  logger.info("exiting::fixedSearch::controller");
  return res.status(200).json(response);
});

export const commonSearch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonSearch::controller");
  const {
    pageNo = 1,
    pageSize = 10,
    shortCode,
    searchText,
    sortBy,
    sortDir,
    searchColumns = [],
    includes,
  } = req.body as SearchRequest;
  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: "Short code not found.",
        errorCode: "NOT_FOUND",
        errorMessage: "Short code not found.",
      }),
    );
  }

  const searchData = await commonServiceFactory.search({
    pageNo,
    pageSize,
    shortCode,
    searchText,
    searchColumns,
    sortBy,
    sortDir,
    shortCodeData,
    includes,
  });

  const response = new BaseResponse(
    { success: true, message: "Data fetched successfully." },
    searchData,
  );
  logger.info("exiting::commonSearch::controller");
  return res.status(200).json(response);
});

export const commonDropdownSearch = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonDropdownSearch::controller");
    const {
      shortCode,
      searchText,
      searchColumns = [],
      fixedNotSearch,
      fixedSearch,
      logic,
    } = req.body as DropdownRequest;
    const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    const searchData = await commonServiceFactory.dropdownSearch({
      shortCode,
      searchText,
      searchColumns,
      shortCodeData,
      fixedSearch,
      fixedNotSearch,
      logic,
    });

    const response = new BaseResponse(
      { success: true, message: "Data fetched successfully." },
      searchData,
    );
    logger.info("exiting::commonDropdownSearch::controller");
    return res.status(200).json(response);
  },
);

export const fixedSearchWoPaginationController = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::fixedSearchWoPaginationController::controller");
    const {
      shortCode,
      searchText,
      sortBy,
      sortDir,
      searchColumns = [],
      fixedNotSearch,
      fixedSearch,
      includes,
    } = req.body as Omit<NewFixedSearchRequest, "pageNo" | "pageSize">;
    const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    const searchData =
      await commonServiceFactory.fixedSearchWoPaginationService({
        shortCode,
        searchText,
        searchColumns,
        sortBy,
        sortDir,
        shortCodeData,
        fixedSearch,
        fixedNotSearch,
        includes,
      });

    const response = new BaseResponse(
      { success: true, message: "Data fetched successfully." },
      searchData,
    );
    logger.info("exiting::fixedSearchWoPaginationController::controller");
    return res.status(200).json(response);
  },
);

export const commonFetch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonFetch::controller");
  const { shortCode, id, includes } = req.body as FetchRequest;
  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: "Short code not found.",
        errorCode: "NOT_FOUND",
        errorMessage: "Short code not found.",
      }),
    );
  }

  const fetchData = await commonServiceFactory.fetch({
    id,
    shortCode,
    shortCodeData,
    includes,
  });

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Data"),
    },
    fetchData,
  );
  logger.info("exiting::commonFetch::controller");
  return res.status(200).json(response);
});

export const commonExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonExcelImport::controller");
    const { shortCode } = req.body as ImportExcel;
    const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const excelImport = await commonServiceFactory.commonExcelImport({
      shortCode,
      file: req.file,
      shortCodeData,
    });

    // deleteFileIfExists(req.file.path);

    const response = new BaseResponse(
      { success: true, message: "Data Imported successfully." },
      excelImport,
    );
    logger.info("exiting::commonExcelImport::controller");
    return res.status(200).json(response);
  },
);

export const commonExcelExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonExcelExport::controller");

    const { shortCode, isSample } = req.body as ExportExcel;
    const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    const wb: Workbook = await commonServiceFactory.commonExcelExport({
      shortCode,
      shortCodeData,
      isSample,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${shortCodeData.tableName}.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  },
);

export const commonDelete = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonDelete::controller");

  const { shortCode, id } = req.body as DeleteParams;
  const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

  if (!shortCodeData) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: "Short code not found.",
        errorCode: "NOT_FOUND",
        errorMessage: "Short code not found.",
      }),
    );
  }

  await commonServiceFactory.delete({
    id: Number(id),
    shortCode,
    shortCodeData,
  });

  const response = new BaseResponse({
    success: true,
    message: generateSuccessMessage("DELETED", "Data"),
  });
  logger.info("exiting::commonDelete::controller");
  return res.status(200).json(response);
});

export const commonUpdateStatus = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonUpdateStatus::controller");
    const { shortCode, id, status } = req.body as updateStatusParams;
    const shortCodeData = await shortCodeService.getShortCodeByCode(shortCode);

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    const data = await commonServiceFactory.updateStatus({
      shortCode,
      id: Number(id),
      status,
      shortCodeData,
    });

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Data"),
      },
      data,
    );
    logger.info("exiting::commonUpdateStatus::controller");
    return res.status(200).json(response);
  },
);

export const commonFSExcelExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonExcelExport::controller");

    const inp = req.body as CommonExcelRequest<OpdDynamicShortCode>;
    const shortCodeData = await shortCodeService.getShortCodeByCode(
      inp.shortCode,
    );

    if (!shortCodeData) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "Short code not found.",
          errorCode: "NOT_FOUND",
          errorMessage: "Short code not found.",
        }),
      );
    }

    const wb: Workbook = await commonServiceFactory.commonExcelService({
      ...inp,
      shortCodeData,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${inp.sheetName}.xlsx"`,
    );
    await wb.xlsx.write(res);
    res.end();
  },
);
