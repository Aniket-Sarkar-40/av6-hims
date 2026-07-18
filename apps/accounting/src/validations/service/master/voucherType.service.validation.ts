import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateVoucherTypeInput } from "@/types/master/voucherType.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { getByUnique } from "@/repository/common.repository.js";
import { VoucherType } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdVoucherType = async (
  id: number,
): Promise<VoucherType> => {
  logger.info("entering::validateIdVoucherType::service::validation");
  validIdCheck(id);
  const voucherType = await commonGetService.getElementById<"VoucherType">({
    cacheCode: "VOUCHER_TYPE",
    canNullReturnable: true,
    id,
    modelName: "VoucherType",
    shortCode: "VOUCHER_TYPE",
    useActiveFlag: true,
  });

  if (!voucherType) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Voucher Type"),
    );
  }
  logger.info("exiting::validateIdVoucherType::service::validation");
  return voucherType;
};

export const createOrUpdateVoucherTypeServiceValidation = async (
  input: CreateOrUpdateVoucherTypeInput,
): Promise<void> => {
  logger.info("entering::createOrUpdateVoucherType::service::validation");
  if (input.id) {
    const existingVoucherType = await validateIdVoucherType(input.id);
    if (existingVoucherType.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "You can't chnage company for existing voucher type",
      );
    }
  } else {
    await validateIdCompany(input.companyId);
  }

  const voucherType = await getByUnique({
    model: "VoucherType",
    where: {
      name: input.name,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (voucherType) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Voucher Type with name ${input.name}`,
      ),
    );
  }
  logger.info("exiting::createOrUpdateVoucherType::service::validation");
};
