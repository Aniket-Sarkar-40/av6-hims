import {
  getCustomerByCustomerEmailFromDb,
  getCustomerByCustomerMobileFromDb,
  getCustomerByIdFromDb,
} from "@/repository/customer/customer.repository.js";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer/customer.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { PmsCustomer } from "@repo/db/generated/prisma/client";

type Mode = "create" | "update";

export const commonCustomerEmailAndMobileCheck = async (
  email: string,
  mobileNo: string,
  mode: Mode,
  currentCustomerId?: number,
): Promise<void> => {
  logger.info(
    "entering::commonCustomerEmailAndMobileCheck::serviceVal::validation",
  );
  const existingByEmail = await getCustomerByCustomerEmailFromDb(email);
  if (
    existingByEmail &&
    (mode === "create" || existingByEmail.id !== currentCustomerId)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "customer Email"),
    );
  }

  const existingByMobile = await getCustomerByCustomerMobileFromDb(mobileNo);
  if (
    existingByMobile &&
    (mode === "create" || existingByMobile.id !== currentCustomerId)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "customer Mobile"),
    );
  }
  logger.info(
    "exiting::commonCustomerEmailAndMobileCheck::serviceVal::validation",
  );
};

export const validateIdCustomer = async (id: number) => {
  logger.info("entering::validateIdCustomer::service::validation");
  validIdCheck(id);
  const customerById = await getCustomerByIdFromDb(id);
  if (!customerById) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "customer"));
  }
  logger.info("exiting::validateIdCustomer::service::validation");
  return customerById;
};

export const createCustomerServiceValidation = async (
  body: CreateCustomerInput,
): Promise<void> => {
  logger.info("entering::createCustomerServiceValidation::service::validation");
  await commonCustomerEmailAndMobileCheck(body.email, body.mobileNo, "create");

  logger.info("exiting::createCustomerServiceValidation::service::validation");
  return;
};
export const updateCustomerServiceValidation = async (
  body: UpdateCustomerInput,
  customerId: number,
): Promise<PmsCustomer> => {
  logger.info("entering::updateCustomerServiceValidation::service::validation");
  if (!body.id) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Item "));
  }
  const customer = await validateIdCustomer(Number(body.id));
  await commonCustomerEmailAndMobileCheck(
    body.email,
    body.mobileNo,
    "update",
    customerId,
  );
  logger.info("exiting::updateCustomerServiceValidation::service::validation");
  return customer;
};
