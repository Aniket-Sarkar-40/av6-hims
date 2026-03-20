import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { consultationComplaintService } from "@/services/appointment/consultationComplaints.service.js";
import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createConsultationComplaints = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createConsultationComplaints::controller");
    const input = req.body as CreateConsultationComplaintsInput;
    const createConsultationComplaints =
      await consultationComplaintService.createConsultationComplaints(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: createConsultationComplaints },
      "Consultation Complaints",
    );
    logger.info("exiting::createConsultationComplaints::controller");
    return res.status(201).json(response);
  },
);
