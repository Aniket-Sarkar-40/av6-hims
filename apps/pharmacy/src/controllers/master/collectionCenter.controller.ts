import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { collectionCenterService } from "@/services/master/collectionCenter.service.js";
import { CollectionCenterReq } from "@/types/master/collectionCenter.js";

export const createCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createCollectionCenter::controller");
    const input = req.body;
    const collectionCenter =
      await collectionCenterService.createCollectionCenter(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Collection Center"),
      },
      collectionCenter,
    );
    logger.info("exiting::createCollectionCenter::controller");
    return res.status(201).json(response);
  },
);

export const updateCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateCollectionCenter::controller");
    const input = req.body as CollectionCenterReq;
    const updateCollectionCenter =
      await collectionCenterService.updateCollectionCenter(input);
    logger.info("exiting::updateCollectionCenter::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Collection Center"),
        },
        updateCollectionCenter,
      ),
    );
  },
);

export const getAllCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllCollectionCenter::controller");
    const collCenters = await collectionCenterService.getAllCollectionCenter();
    logger.info("exiting::getAllCollectionCenter::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Collection Center"),
        },
        collCenters,
      ),
    );
  },
);

export const getAvailableCollectionCenter = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAvailableCollectionCenter::controller");
    const collCenters =
      await collectionCenterService.getAvailableCollectionCenter();
    logger.info("exiting::getAvailableCollectionCenter::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Collection Center"),
        },
        collCenters,
      ),
    );
  },
);

export const getCollectionCenterById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getCollectionCenterById::controller");
    const { collectionCenterId } = req.query as { collectionCenterId: string };

    const medCategory = await collectionCenterService.getCollectionCenterById(
      Number(collectionCenterId),
    );

    if (!medCategory) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getCollectionCenterById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Collection Center"),
        },
        medCategory,
      ),
    );
  },
);

export const getBranchOrWarehouse = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getBranchOrWarehouse::controller");
    const { id } = req.query;
    const branchOrWarehouse =
      await collectionCenterService.getAllBranchAndWarehouse(Number(id));
    logger.info("exiting::getBranchOrWarehouse::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Branche and Warehouse"),
        },
        branchOrWarehouse,
      ),
    );
  },
);
