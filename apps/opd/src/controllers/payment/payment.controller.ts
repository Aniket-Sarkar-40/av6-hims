import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { paymentService } from "@/services/payment/payment.service.js";
import {
  CreatePaymentInput,
  GetPaymentDetailsReq,
  GetPaymentReq,
} from "@/types/payment/payment.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const getPayment = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getPayment::controller");
  const input = req.body as GetPaymentReq;
  const record = await paymentService.getpayment(input);
  const response = BaseResponse.success(
    { type: "FETCHED", data: record },
    "Payment Details",
  );
  logger.info("exiting::getPayment::controller");
  return res.status(200).json(response);
});

export const createPayment = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createPayment::controller");
  const input = req.body as CreatePaymentInput;
  const record = await paymentService.createPayment(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: record },
    "Payment",
  );
  logger.info("exiting::createPayment::controller");
  return res.status(201).json(response);
});

export const getPaymentDetailsWithModule = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPaymentDetailsWithModule::controller");
    const input = req.body as GetPaymentDetailsReq;
    const record = await paymentService.getPaymentDetailsModuleWise(input);
    const response = BaseResponse.success(
      { type: "FETCHED", data: record },
      "Payment Detials module wise",
    );
    logger.info("exiting::getPaymentDetailsWithModule::controller");
    return res.status(200).json(response);
  },
);
