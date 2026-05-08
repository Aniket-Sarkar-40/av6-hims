import { stockTransferService } from "@/services/stock/stockTransfer.service.js";
import {
  CreateItemStockTransferInput,
  StockTransferAcknowledgeInput,
  StockTransferSearchInput,
  StockTransferUpdate,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createStockTransfer::controller");
    const input = req.body as CreateItemStockTransferInput;
    const response = await stockTransferService.createStockTransfer(input);

    logger.info("exiting::createStockTransfer::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Stock Transfer"),
        },
        response
      )
    );
  }
);

export const updateStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateStockTransfer::controller");
    const input = req.body as UpdateItemStockTransferInput;
    const response = await stockTransferService.updateStockTransfer(input);

    logger.info("exiting::updateStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Stock Transfer"),
        },
        response
      )
    );
  }
);

export const deleteStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteStockTransfer::controller");
    const { id, ccId } = req.body as { id?: string; ccId?: string };
    if (!id || !ccId) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
          message: "Missing required query parameters: id and ccId",
        })
      );
    }
    const input: StockTransferUpdate = {
      id: Number(id),
      ccId: Number(ccId),
    };
    await stockTransferService.deleteStockTransfer(input);

    logger.info("exiting::deleteStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Stock Transfer"),
      })
    );
  }
);

export const approveStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveStockTransfer::controller");
    const input = req.body as StockTransferUpdate;
    const response = await stockTransferService.approveStockTransfer(input);

    logger.info("exiting::approveStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("APPROVED", "Stock Transfer"),
        },
        response
      )
    );
  }
);
export const approveReturnStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::approveReturnStockTransfer::controller");
    const input = req.body as StockTransferUpdate;
    const response = await stockTransferService.approveReturnStockTransfer(
      input
    );

    logger.info("exiting::approveReturnStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("APPROVED", "Stock Transfer Return"),
        },
        response
      )
    );
  }
);

export const acknowledgeStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::acknowledgeStockTransfer::controller");
    const input = req.body as StockTransferAcknowledgeInput;
    const response = await stockTransferService.acknowledgeStockTransfer(input);

    logger.info("exiting::acknowledgeStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("ACKNOWLEDGED", "Stock Transfer"),
        },
        response
      )
    );
  }
);

export const getStockTransferById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getStockTransferById::controller");
    const { id } = req.query as { id: string };
    const response = await stockTransferService.getStockTransferById(
      Number(id)
    );
    logger.info("exiting::getStockTransferById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Stock Transfer"),
        },
        response
      )
    );
  }
);

export const getAllStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllStockTransfer::controller");
    const response = await stockTransferService.getAllStockTransfer();
    logger.info("exiting::getAllStockTransfer::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Stock Transfer"),
        },
        response
      )
    );
  }
);

export const searchStockTransfer = TryCatch(
  async (req: Request, res: Response) => {
    const input = req.body as StockTransferSearchInput;
    const response = await stockTransferService.searchStockTransfers(input);

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Stock Transfer"),
        },
        response
      )
    );
  }
);
