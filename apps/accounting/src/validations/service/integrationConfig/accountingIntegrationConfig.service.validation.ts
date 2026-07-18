import {
  getAccountingIntegrationConfigDetailsFromDb,
  getAccountingIntegrationConfigFromDb,
} from "@/repository/integrationConfig/accountingIntegrationConfig.repository.js";
import {
  AccountingIntegrationConfigResponse,
  CreateOrUpdateAccountingIntegrationConfigInput,
} from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdGroup } from "../master/group.service.validation.js";
import { validateIdVoucherType } from "../master/voucherType.service.validation.js";
import { getByUnique } from "@/repository/common.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { AccountingIntegrationConfigDetails } from "@repo/db/generated/prisma/client";

export const validateIdAccountingIntegrationConfig = async (
  id: number
): Promise<AccountingIntegrationConfigResponse> => {
  logger.info(
    "entering::validateIdAccountingIntegrationConfig::service::validation"
  );
  validIdCheck(id);
  const accountingIntegrationConfig =
    await getAccountingIntegrationConfigFromDb(id);

  if (!accountingIntegrationConfig) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Accounting Integration Config")
    );
  }
  logger.info(
    "exiting::validateIdAccountingIntegrationConfig::service::validation"
  );
  return accountingIntegrationConfig;
};

export const validateIdAccountingIntegrationConfigDetails = async (
  id: number
): Promise<AccountingIntegrationConfigDetails> => {
  logger.info(
    "entering::validateIdAccountingIntegrationConfigDetails::service::validation"
  );
  validIdCheck(id);
  const accountingIntegrationConfigDetails =
    await getAccountingIntegrationConfigDetailsFromDb(id);

  if (!accountingIntegrationConfigDetails) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Accounting Integration Config Details")
    );
  }
  logger.info(
    "exiting::validateIdAccountingIntegrationConfigDetails::service::validation"
  );
  return accountingIntegrationConfigDetails;
};

export const validateCreateOrUpdateAccountingIntegrationConfig = async (
  input: CreateOrUpdateAccountingIntegrationConfigInput
) => {
  logger.info(
    "entering::validateCreateOrUpdateAccountingIntegrationConfig::service::validation"
  );

  if (input.id) {
    const existing = await validateIdAccountingIntegrationConfig(input.id);
    input.existing = existing;
  }

  await validateIdVoucherType(input.voucherTypeId);

  const config = await getByUnique({
    model: "AccountingIntegrationConfig",
    where: {
      refType: input.refType,
      subRefType: input.subRefType,
      voucherTypeId: input.voucherTypeId,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (config) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Accounting Integration Config")
    );
  }

  for (const detail of input.accountingIntegrationConfigDetails) {
    if (detail.id) {
      const existingDetail = await validateIdAccountingIntegrationConfigDetails(
        detail.id
      );
      if (existingDetail.accountingIntegrationConfigId !== input.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            `Accounting Integration Config Details (id: ${detail.id})`,
            `Accounting Integration Config (id: ${input.id})`
          )
        );
      }
    }
    if (detail.groupId) {
      await validateIdGroup(detail.groupId);
    }
  }

  logger.info(
    "exiting::validateCreateOrUpdateAccountingIntegrationConfig::service::validation"
  );
  return input;
};
