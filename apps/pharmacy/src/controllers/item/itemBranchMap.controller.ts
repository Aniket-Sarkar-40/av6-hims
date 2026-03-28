import { TryCatch } from "@repo/platform";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { itemBranchService } from "@/services/item/itemBranchMap.service.js";
import {
  BranchToBranchPriceCopy,
  createItemBranchMapInput,
  GetItemBranchPricing,
  ItemBranchMap,
  ItemBranchMapExcelInput,
  ItemWiseItemBranchMapUpdate,
} from "@/types/item/itemBranchMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Workbook } from "exceljs";
import { Request, Response } from "express";

export const createItemBranchMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createItemBranchMap::controller");
    const input = req.body as createItemBranchMapInput;
    await itemBranchService.createItemBranchMap(input);
    logger.info("exiting::createItemBranchMap::controller");
    return res.status(201).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("CREATED", "Item Branch mapping"),
      }),
    );
  },
);

export const updateItemBranchMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemBranchMap::controller");
    const input = req.body as ItemBranchMap;
    await itemBranchService.updateItemBranchMap(input);
    logger.info("exiting::updateItemBranchMap::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "Item Branch mapping"),
      }),
    );
  },
);

export const getItemBranch = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getItemBranch::controller");
  const input = req.body as GetItemBranchPricing;
  const itemBranch = await itemBranchService.getItemBranchPricing(input);
  logger.info("exiting::getItemBranch::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Item Branch mapping"),
      },
      itemBranch,
    ),
  );
});

export const deleteItemBranch = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteItemBranch::controller");
    const id = req.params.id;
    await itemBranchService.deleteItemBranchMap(Number(id));
    logger.info("exiting::deleteItemBranch::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Item Branch mapping"),
      }),
    );
  },
);

export const excelBranchItemMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::excelBranchItemMap::controller");

    const input = req.body as ItemBranchMapExcelInput;

    const wb: Workbook = await itemBranchService.buildExcelItemBranchMap(input);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="item_branch_map.xlsx"`,
    );
    await wb.xlsx.write(res);
    logger.info("exiting::excelBranchItemMap::controller");
    res.end();
  },
);

export const branchItemMapExcelImport = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::branchItemMapExcelImport::controller");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    await itemBranchService.branchItemMapExcelImport(req.file.path);

    deleteFileIfExists(req.file.path);

    const response = new BaseResponse({
      success: true,
      message: "Branch Item Mapping Import started.",
    });
    logger.info("exiting::branchItemMapExcelImport::controller");
    return res.status(200).json(response);
  },
);

export const updateItemWiseItemBranchMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateItemWiseItemBranchMap::controller");
    const input = req.body as ItemWiseItemBranchMapUpdate;
    await itemBranchService.updateBranchWiseItemBranchMap(input);
    logger.info("exiting::updateItemWiseItemBranchMap::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "Item Branch mapping"),
      }),
    );
  },
);

export const BranchToBranchCopyItemBranchMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::BranchToBranchCopyItemBranchMap::controller");
    const input = req.body as BranchToBranchPriceCopy;
    await itemBranchService.copyBranchToBranchPrice(input);
    logger.info("exiting::BranchToBranchCopyItemBranchMap::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("UPDATED", "Item Branch mapping"),
      }),
    );
  },
);

export const getItemBranchMapDetailsForUpdate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getItemBranchMapDetailsForUpdate::controller");
    const { itemId } = req.query as { itemId: string };
    const result = await itemBranchService.getItemBranchMapDetails(
      Number(itemId),
    );
    logger.info("exiting::getItemBranchMapDetailsForUpdate::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Item Branch mapping"),
        },
        result,
      ),
    );
  },
);
