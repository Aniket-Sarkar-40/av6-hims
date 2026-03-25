import { TryCatch } from "@repo/platform";
import { customerService } from "@/services/customer/customer.service.js";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer/customer.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createCustomer = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createCustomer::controller");
  const body = req.body as CreateCustomerInput;
  const customer = await customerService.createCustomer(body);
  logger.info("exiting::createCustomer::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Customer"),
      },
      customer,
    ),
  );
});

export const getAllCustomers = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllCustomers::controller");
  const customer = await customerService.getAllCustomers();
  logger.info("exiting::getAllCustomers::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Customer"),
      },
      customer,
    ),
  );
});
export const getCustomerById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getCustomerById::controller");
  const { customerId } = req.query as { customerId: string };
  const customerData = await customerService.getCustomerById(
    Number(customerId),
  );
  if (!customerData) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Customer"));
  }
  logger.info("exiting::getCustomerById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Customer"),
      },
      customerData,
    ),
  );
});

export const updateCustomer = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateCustomer::controller");
  const body = req.body as UpdateCustomerInput;

  const updateCustomer = await customerService.updateCustomer(
    Number(body.id),
    body,
  );

  logger.info("exiting::updateCustomer::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Customer"),
      },
      updateCustomer,
    ),
  );
});
