import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodDonor } from "@/types/bloodDonor/bloodDonor.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import {
  BloodBankUinShortCode,
  BloodDonor,
  BloodDonorGender,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodDonor = async (id: number): Promise<BloodDonor> => {
  logger.info("entering::validateIdBloodDonor::service::validation");

  validIdCheck(id);

  const bloodDonor = await getByUnique({
    model: "BloodDonor",
    where: {
      id,
    },
  });
  if (!bloodDonor) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Donor"),
    );
  }
  logger.info("exiting::validateIdBloodDonor::service::validation");

  return bloodDonor;
};

export const createOrUpdateBloodDonorServiceValidation = async (
  body: CreateOrUpdateBloodDonor,
) => {
  logger.info(
    "entering::createOrUpdateBloodDonorServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodDonor(body.id);
  }
  await validateIdBloodBankCenter(body.bloodBankCenterId);

  if (!body.donorNo) {
    body.donorNo = await uinServiceFactory.generateUIN(
      BloodBankUinShortCode.DONOR,
    );
  }

  if (body.phoneNo && (body.donorName || body.dateOfBirth)) {
    const phoneDuplicate = await getByUnique({
      model: "BloodDonor",
      where: {
        phoneNo: body.phoneNo,
        NOT: body.id ? { id: body.id } : undefined,
        OR: [
          ...(body.donorName ? [{ donorName: body.donorName }] : []),
          ...(body.dateOfBirth ? [{ dateOfBirth: body.dateOfBirth }] : []),
        ],
      },
    });

    if (phoneDuplicate) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Phone No for this Donor Name or Date of Birth",
        ),
      );
    }
  }

  if (body.gender && !Object.values(BloodDonorGender).includes(body.gender)) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Gender"),
    );
  }

  if (body.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(body.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (body.ageYears && body.ageYears !== age) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          "Age Years",
          "Age calculated from DOB",
        ),
      );
    }
  }

  if (body.email) {
    const emailDuplicate = await getByUnique({
      model: "BloodDonor",
      where: {
        email: body.email,
        NOT: body.id ? { id: body.id } : undefined,
      },
    });

    if (emailDuplicate) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Email"),
      );
    }
  }

  const duplicateDonor = await getByUnique({
    model: "BloodDonor",
    where: {
      bloodBankCenterId: body.bloodBankCenterId,
      donorNo: body.donorNo,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (duplicateDonor) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Donor No for this Blood Bank Center",
      ),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodDonorServiceValidation::service::validation",
  );
};
