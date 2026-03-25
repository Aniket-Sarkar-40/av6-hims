import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateDistributorInput,
  UpdateDistributorInput,
} from "@/types/distributor/distributor.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Distributor,
  PmsTaxIdentificationDetails,
} from "@repo/db/generated/prisma/client";

export async function createDistributor(
  data: CreateDistributorInput,
): Promise<Distributor> {
  logger.info("entering::createDistributor::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const distributor = await db.distributor.create({
    data: {
      ...data,
      proCountryCode: data.proCountryCode
        ? data.proCountryCode
        : setting?.countryCode,
      dpCountryCode: data.dpCountryCode
        ? data.dpCountryCode
        : setting?.countryCode,
      taxIdentificationDetails: {
        create:
          data.taxIdentificationDetails?.map((tid) => ({
            taxIdentificationName: tid.taxIdentificationName,
            taxIdentificationValue: tid.taxIdentificationValue,
            createdBy: store?.user?.id,
          })) ?? undefined,
      },
      createdBy: store?.user?.id,
    },
    include: {
      taxIdentificationDetails: true,
    },
  });
  logger.info("exiting::createDistributor::repository");
  return distributor;
}

export async function getDistributorByIdWoDto(
  id: number,
): Promise<Distributor | null> {
  logger.info("entering::getDistributorByIdWoDto::repository");
  return db.distributor.findUnique({
    where: { id, isActive: true },
  });
}

export async function getAllDistributors(): Promise<Distributor[]> {
  logger.info("entering::getAllDistributors::repository");
  return db.distributor.findMany({
    where: { isActive: true },
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
}

export async function getDistributorByProPhoneNumber(
  phoneNumber: string,
): Promise<Distributor | null> {
  logger.info("entering::getDistributorByPropPhoneNumber::repository");
  return db.distributor.findFirst({
    where: { proInPhone: phoneNumber, isActive: true },
  });
}

export async function getDistributorByProEmailId(
  email: string,
): Promise<Distributor | null> {
  logger.info("entering::getDistributorByProEmailId::repository");
  return db.distributor.findFirst({
    where: { proInEmail: email, isActive: true },
  });
}

export async function updateDistributorDb(
  id: number,
  data: UpdateDistributorInput,
): Promise<Distributor> {
  logger.info("entering::updateDistributor::repository");
  const store = requestStorage.getStore();
  delete (data as { id?: number }).id;
  return db.distributor.update({
    where: { id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
      taxIdentificationDetails: {
        updateMany: {
          where: { isActive: true },
          data: {
            isActive: false,
          },
        },
        create:
          data.taxIdentificationDetails?.map((tid) => ({
            taxIdentificationName: tid.taxIdentificationName,
            taxIdentificationValue: tid.taxIdentificationValue,
            updatedBy: store?.user?.id,
          })) ?? [],
      },
    },
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
}

export async function deleteDistributorDb(id: number): Promise<Distributor> {
  logger.info("entering::deleteDistributor::repository");
  const store = requestStorage.getStore();
  return db.distributor.update({
    where: { id },
    data: {
      isActive: false,
      taxIdentificationDetails: {
        deleteMany: {},
      },
      updatedBy: store?.user?.id,
    },
  });
}

export async function deleteDistributorTaxIdentificationsDetails(
  id: number,
): Promise<PmsTaxIdentificationDetails> {
  logger.info(
    "entering::deleteDistributorTaxIdentificationsDetails::repository",
  );
  const store = requestStorage.getStore();
  return db.pmsTaxIdentificationDetails.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: store?.user?.id,
      deletedAt: new Date(),
    },
  });
}

export async function getDistributorTaxIdentificationsDetails(
  id: number,
): Promise<PmsTaxIdentificationDetails[]> {
  logger.info("entering::getDistributorTaxIdentificationsDetails::repository");
  return db.pmsTaxIdentificationDetails.findMany({
    where: { distributorId: id, isActive: true },
  });
}
