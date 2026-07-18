import { getByUnique } from "@/repository/common.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateCostCenterInput } from "@/types/master/costCenter.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { CostCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdCostCenter = async (id: number): Promise<CostCenter> => {
  logger.info("entering::validateIdCostCenter::service::validation");
  validIdCheck(id);
  const costCenter = await commonGetService.getElementById<"CostCenter">({
    cacheCode: "COST_CENTER",
    canNullReturnable: true,
    id,
    modelName: "CostCenter",
    shortCode: "COST_CENTER",
    useActiveFlag: true,
  });

  if (!costCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Cost Center"),
    );
  }
  logger.info("exiting::validateIdCostCenter::service::validation");
  return costCenter;
};

export const CreateOrUpdateCostCenterServiceValidation = async (
  input: CreateOrUpdateCostCenterInput,
): Promise<void> => {
  logger.info("entering::createOrUpdateCostCenter::service::validation");
  if (input.id) {
    const existingCostCenter = await validateIdCostCenter(input.id);
    if (existingCostCenter.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "You can't chnage company for existing cost center",
      );
    }
  }

  await validateIdCompany(input.companyId);

  if (input.parentId) {
    await validateIdCostCenter(input.parentId);
  }

  if (input.id === input.parentId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_ASSOCIATION",
        "Cost Center",
        "Parent Cost Center",
      ),
    );
  }

  const costCenter = await getByUnique({
    model: "CostCenter",
    where: {
      name: input.name,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (costCenter) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        `Cost Center with name ${input.name}`,
      ),
    );
  }
  logger.info("exiting::createOrUpdateCostCenter::service::validation");
};
