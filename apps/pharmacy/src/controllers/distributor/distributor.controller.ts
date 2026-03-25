import { TryCatch } from "@repo/platform";
import { distributorService } from "@/services/distributor/distributor.service.js";
import {
  CreateDistributorInput,
  UpdateDistributorInput,
} from "@/types/distributor/distributor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const distributorCreate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::distributorCreate::controller");
    const body = req.body as CreateDistributorInput;
    const createdDistributor = await distributorService.createDistributor(body);
    logger.info("exiting::distributorCreate::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Distributor"),
        },
        createdDistributor,
      ),
    );
  },
);

export const distributorUpdate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::distributorUpdate::controller");
    const distributor = req.body as UpdateDistributorInput;
    const updatedDistributor =
      await distributorService.updateDistributorService(distributor);
    logger.info("exiting::distributorUpdate::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Distributor"),
        },
        updatedDistributor,
      ),
    );
  },
);

export const getAllDistributor = TryCatch(
  async (_req: Request, res: Response) => {
    logger.info("entering::getAllDistributor::controller");
    const distributors = await distributorService.getAllDistributor();
    logger.info("exiting::getAllDistributor::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Distributor"),
        },
        distributors,
      ),
    );
  },
);

export const getDistributorById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getDistributorById::controller");

    const id = req.query.id as string;

    const distributor = await distributorService.getDistributorById(Number(id));
    logger.info("exiting::getDistributorById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Distributor"),
        },
        distributor,
      ),
    );
  },
);

export const distributorDelete = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::distributorDelete::controller");
    const { id } = req.params as { id: string };
    await distributorService.deleteDistributor(Number(id));
    logger.info("exiting::distributorDelete::controller");
    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Distributor"),
      }),
    );
  },
);
