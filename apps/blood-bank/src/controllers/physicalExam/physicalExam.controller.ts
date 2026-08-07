import { physicalExamService } from "@/services/physicalExam/physicalExam.service.js";
import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/physicalExam/physicalExam.js";
import { TryCatch } from "@repo/platform";
import { logger } from "@repo/platform/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Request, Response } from "express";

export const upsertPhysicalExam = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::upsertPhysicalExam::controller");
    const input = req.body as CreateOrUpdateBloodDonationPhysicalExam;
    const updated = await physicalExamService.upsertPhysicalExam(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Physical Exam",
    );
    logger.info("exiting::upsertPhysicalExam::controller");
    return res.status(200).json(response);
  },
);
