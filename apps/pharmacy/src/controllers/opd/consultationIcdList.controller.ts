import { TryCatch } from "@repo/platform";
import { consultationIcdListService } from "@/services/opd/consultationIcdList.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const getConsultationIcdList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getConsultationIcdList::controller");

    const input = req.body.appointmentId as string;

    const result = await consultationIcdListService.consultationIcdList(
      Number(input),
    );

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Consultation ICD list"),
      },
      result,
    );

    logger.info("exiting::getConsultationIcdList::controller");
    return res.status(200).json(response);
  },
);
