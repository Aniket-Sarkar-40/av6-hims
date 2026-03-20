import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { referToDoctorService } from "@/services/appointment/referToDoctor.service.js";
import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createReferToDoctor = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createReferToDoctor::controller");
    const input = req.body as CreateReferToDoctorInput;
    const referToDoctor = await referToDoctorService.createReferToDoctor(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: referToDoctor },
      "Patient Refer To Doctor",
    );
    logger.info("exiting::createReferToDoctor::controller");
    return res.status(201).json(response);
  },
);

export const updateReferToDoctor = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateReferToDoctor::controller");
    const input = req.body as UpdateReferToDoctorInput;
    const referToDoctor = await referToDoctorService.updateReferToDoctor(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: referToDoctor },
      "Patient Refer To Doctor",
    );
    logger.info("exiting::updateReferToDoctor::controller");
    return res.status(200).json(response);
  },
);
