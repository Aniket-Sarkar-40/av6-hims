import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { CreateCustomerInput } from "@/types/customer/customer.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsCustomer } from "@repo/db/generated/prisma/client";

export const getCustomerByCustomerEmailFromDb = async (
  customerEmail: string,
): Promise<PmsCustomer | null> => {
  logger.info("entering::getCustomerByCustomerEmailFromDb::repository");
  return db.pmsCustomer.findFirst({
    where: {
      email: customerEmail,
      isActive: true,
    },
  });
};

export const getCustomerByCustomerMobileFromDb = async (
  customerMobile: string,
): Promise<PmsCustomer | null> => {
  logger.info("entering::getCustomerByCustomerMobileFromDb::repository");
  return db.pmsCustomer.findFirst({
    where: { mobileNo: customerMobile, isActive: true },
  });
};

export const createCustomerInDb = async (
  customer: CreateCustomerInput,
): Promise<PmsCustomer> => {
  logger.info("entering::createCustomerInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  return db.pmsCustomer.create({
    data: {
      ...customer,
      countryCode: customer.countryCode
        ? customer.countryCode
        : setting?.countryCode,
      createdBy: store?.user?.id,
    },
  });
};

export const getAllCustomerFromDb = async (): Promise<PmsCustomer[]> => {
  logger.info("entering::getAllCustomerFromDb::repository");
  return db.pmsCustomer.findMany({
    where: {
      isActive: true,
    },
  });
};
export const getCustomerByIdFromDb = async (
  id: number,
): Promise<PmsCustomer | null> => {
  logger.info("entering::getCustomerByIdFromDb::repository");
  return db.pmsCustomer.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};
export const updateCustomerInDb = async (
  id: number,
  customer: CreateCustomerInput,
): Promise<PmsCustomer> => {
  logger.info("entering::updateCustomerInDb::repository");
  const store = requestStorage.getStore();
  return db.pmsCustomer.update({
    where: { id },
    data: {
      ...customer,
      updatedBy: store?.user?.id,
    },
  });
};
