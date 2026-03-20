import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
// import { deleteFileIfExists } from "@repo/shared/utils/file.utils.js";
import { generalBillPricingService } from "@/services/master/generalBillPricing.service.js";
import {
  CopyGeneralBillPricing,
  GeneralBillPricingExcelInput,
  CreateGeneralBillPricingInput,
  GeneralBillPricingSearchInput,
  UpdateGeneralBillPricingInput,
} from "@/types/master/generalBillPricing.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createGeneralBillPricing = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createGeneralBillPricing::controller");
    const input = req.body as CreateGeneralBillPricingInput;
    const created =
      await generalBillPricingService.createGeneralBillPricing(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "General Bill Pricing",
    );
    logger.info("exiting::createGeneralBillPricing::controller");
    return res.status(201).json(response);
  },
);
export const updateGeneralBillPricing = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateGeneralBillPricing::controller");
    const input = req.body as UpdateGeneralBillPricingInput;
    const updated =
      await generalBillPricingService.updateGeneralBillPricing(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "General Bill Pricing",
    );
    logger.info("exiting::updateGeneralBillPricing::controller");
    return res.status(200).json(response);
  },
);

export const generalBillPricingMapExcelExport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::generalBillPricingMapExcelExport::controller");

    const wb =
      await generalBillPricingService.buildExcelGeneralBillPricingMap();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="general_bill_pricing_map.xlsx"`,
    );

    await wb.xlsx.write(res);

    logger.info("exiting::generalBillPricingMapExcelExport::controller");
    res.end();
  },
);

export const generalBillPricingMapExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::generalBillPricingMapExcelImport::controller");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const { ccId } = req.body;

    const input: GeneralBillPricingExcelInput = {
      ccId: Number(ccId),
      filePath: req.file.path,
    };

    await generalBillPricingService.generalBillPricingMapExcelImport(input);

    // deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "General Bill Pricing import started.",
    });

    logger.info("exiting::generalBillPricingMapExcelImport::controller");
    return res.status(200).json(response);
  },
);

export const copyGeneralBillPricing = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::copyGeneralBillPricing::controller");

    const input = req.body as CopyGeneralBillPricing;

    await generalBillPricingService.copyGeneralBillPricing(input);

    const response = new BaseResponse({
      success: true,
      message: "General Bill Pricing copied successfully.",
    });

    logger.info("exiting::copyGeneralBillPricing::controller");
    return res.status(200).json(response);
  },
);

export const getGeneralBillPricingWithItemByCcId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getGeneralBillPricingWithItemByCcId::controller");

    const input = req.body as GeneralBillPricingSearchInput;

    const data =
      await generalBillPricingService.getGeneralBillPricingWithItemByCcId(
        input,
      );

    const response = BaseResponse.success(
      { type: "FETCHED", data },
      "General Bill Pricing",
    );

    logger.info("exiting::getGeneralBillPricingWithItemByCcId::controller");

    return res.status(200).json(response);
  },
);
