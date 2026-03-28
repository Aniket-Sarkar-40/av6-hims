import { commonServiceFactory } from "@/config/core.config.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { commonService } from "@/services/common.service.js";
import { shortCodeService } from "@/services/shortCode.service.js";
import { LockUnlockParams } from "@/types/common.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateSuccessMessage,
  generateValidationErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import {
  CommonExcelRequest,
  DeleteParams,
  DropdownRequest,
  DynamicCrudConfig,
  DynamicShortCode,
  ExportExcel,
  FetchRequest,
  ImportExcel,
  NewFixedSearchRequest,
  SearchRequest,
  UpdateConfigByCodeInput,
  updateStatusParams,
} from "av6-core";
import { Workbook } from "exceljs";
import { Request, Response } from "express";
import { validateUpdateDynamicShortCodeConfig } from "@/validations/service/commonService.validation.js";

//============= NEW ===========================

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
    logic,
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
    logic,
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
      fixedSearch,
      fixedNotSearch,
      selectColumns,
      sortBy,
      sortDir,
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
      selectColumns,
      sortBy,
      sortDir,
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
      logic,
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
        logic,
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

export const commonCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonCreate::controller");
  const input = req.body as Record<string, unknown>;
  const shortCode = req.query.shortCode as string;

  if (!shortCode) {
    throw new ErrorHandler(
      400,
      generateValidationErrorMessage("REQUIRED", `short code`),
    );
  }

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
  const data = await commonServiceFactory.create({
    body: input,
    shortCodeData,
  });

  const response = BaseResponse.success(
    { type: "CREATED", data },
    shortCode.replace("_", " "),
  );

  logger.info("exiting::commonCreate::controller");
  return res.status(201).json(response);
});

export const commonUpdate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::commonUpdate::controller");
  const input = req.body as Record<string, unknown>;
  const shortCode = req.query.shortCode as string;

  if (!shortCode) {
    throw new ErrorHandler(
      400,
      generateValidationErrorMessage("REQUIRED", `short code`),
    );
  }

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

  const cfg = shortCodeData.config as unknown as DynamicCrudConfig;
  if (!cfg) {
    throw new ErrorHandler(
      500,
      `Configuration not found for short code: ${shortCodeData.shortCode}`,
    );
  }

  const pkField = cfg?.primaryKey;
  const pkLocation = cfg?.operations?.update?.primaryKeyFrom;
  if (!pkField || !pkLocation) {
    throw new ErrorHandler(
      500,
      `Primary key configuration not found for short code: ${shortCodeData.shortCode}`,
    );
  }

  const pkValue =
    pkLocation === "body"
      ? input[pkField]
      : pkLocation === "params"
        ? req.params[pkField]
        : req.query[pkField];

  if (isNaN(Number(pkValue))) {
    throw new ErrorHandler(400, `Invalid primary key value: ${pkValue}`);
  }

  const data = await commonServiceFactory.update({
    body: input,
    shortCodeData,
    id: Number(pkValue),
  });

  const response = BaseResponse.success(
    { type: "UPDATED", data },
    shortCode.replace("_", " "),
  );

  logger.info("exiting::commonUpdate::controller");
  return res.status(200).json(response);
});

export const commonMultiCreateUpdate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonMultiCreateUpdate::controller");
    const input = req.body as Record<string, unknown>;
    const shortCode = req.query.shortCode as string;

    if (!shortCode) {
      throw new ErrorHandler(
        400,
        generateValidationErrorMessage("REQUIRED", `short code`),
      );
    }

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

    const data = await commonServiceFactory.commonBulkUpsert({
      body: input,
      shortCodeData,
    });

    const response = BaseResponse.success(
      { type: "CREATED", data },
      shortCode.replace("_", " "),
    );

    logger.info("exiting::commonMultiCreateUpdate::controller");
    return res.status(201).json(response);
  },
);

export const commonFSExcelExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonExcelExport::controller");

    const inp = req.body as CommonExcelRequest<DynamicShortCode>;
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

export const updateConfigByCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateConfigByCode::controller");
    const input = req.body as UpdateConfigByCodeInput;
    const shortCode = input.shortCode;

    if (!shortCode) {
      throw new ErrorHandler(
        400,
        generateValidationErrorMessage("REQUIRED", `short code`),
      );
    }
    await validateUpdateDynamicShortCodeConfig(input);

    const data = await commonServiceFactory.updateConfigByCode(input);

    const response = BaseResponse.success(
      { type: "UPDATED", data },
      "Short Code Config",
    );

    logger.info("exiting::updateConfigByCode::controller");
    return res.status(200).json(response);
  },
);

export const getConfigByShortCode = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getConfigByShortCode::controller");
    const shortCode = req.query.shortCode as string;

    if (!shortCode) {
      throw new ErrorHandler(
        400,
        generateValidationErrorMessage("REQUIRED", `short code`),
      );
    }

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

    const cfg = shortCodeData.config as unknown as DynamicCrudConfig;
    if (!cfg) {
      throw new ErrorHandler(
        404,
        `Configuration not found for short code: ${shortCodeData.shortCode}`,
      );
    }

    const response = BaseResponse.success(
      {
        type: "FETCHED",
        data: {
          config: cfg,
          permission: shortCodeData.permission,
        },
      },
      "Short Code Config",
    );

    logger.info("exiting::getConfigByShortCode::controller");
    return res.status(200).json(response);
  },
);

export const commonLockUnlock = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::commonLockUnlock::controller");

    const { shortCode, id } = req.body as LockUnlockParams;

    const lockUnlockResult = await commonService.lockUnlock({
      shortCode,
      id: Number(id),
    });

    const action = lockUnlockResult ? "Locked" : "Unlocked";
    const response = BaseResponse.success(
      {
        type: "UPDATED",
        data: { shortCode, id, isLock: lockUnlockResult.isLock },
      },
      action,
    );

    logger.info("exiting::commonLockUnlock::controller");

    return res.status(200).json(response);
  },
);
