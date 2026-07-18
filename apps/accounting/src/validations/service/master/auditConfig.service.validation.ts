import { checkAuditConfigFieldDuplicate } from "@/repository/master/auditConfig.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { AuditConfig } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdAuditConfig = async (
  id: number
): Promise<AuditConfig> => {
  logger.info("entering::validateIdAuditConfig::service::validation");
  validIdCheck(id);
  const auditConfig = await commonGetService.getElementById<"AuditConfig">({
    cacheCode: "AUDIT_CONFIG",
    canNullReturnable: true,
    id,
    modelName: "AuditConfig",
    shortCode: "AUDIT_CONFIG",
    useActiveFlag: true,
  });

  if (!auditConfig) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Audit Config")
    );
  }
  logger.info("exiting::validateIdAuditConfig::service::validation");
  return auditConfig;
};

export const createOrUpdateAuditConfigServiceValidation = async (
  body: CreateOrUpdateAuditConfig
) => {
  logger.info(
    "entering::createOrUpdateAuditConfigServiceValidation::service::validation"
  );

  const duplicate = await checkAuditConfigFieldDuplicate(body);

  if (body.id) {
    await validateIdAuditConfig(body.id);
    if (duplicate && duplicate.auditConfig.id !== body.id) {
      const fields = duplicate.duplicateFields.join(", ");
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", `Audit Config with ${fields}`)
      );
    }
  }

  if (duplicate) {
    const fields = duplicate.duplicateFields.join(", ");
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", `Audit Config with ${fields}`)
    );
  }
  logger.info(
    "exiting::createOrUpdateAuditConfigServiceValidation::service::validation"
  );
};
