import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateGroupInput } from "@/types/master/group.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { getLedgersByGroupId } from "@/repository/master/ledger.repository.js";
import {
  AccountingPrimaryCategory,
  Group,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdGroup = async (id: number): Promise<Group> => {
  logger.info("entering::validateIdGroup::service::validation");
  validIdCheck(id);
  const group = await commonGetService.getElementById<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    id,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });

  if (!group) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Group"));
  }
  logger.info("exiting::validateIdGroup::service::validation");
  return group;
};

export const createOrUpdateGroupServiceValidation = async (
  input: CreateOrUpdateGroupInput
): Promise<void> => {
  logger.info("entering::createOrUpdateGroup::service::validation");

  if (input.id) {
    const existingGroup = await validateIdGroup(input.id);
    if (existingGroup.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "You can't change company for existing group"
      );
    }
  }
  // check group name is unique for the provided company
  await validateIdCompany(input.companyId);

  if (input.isPrimaryGroup && input.parentId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_NOT_ALLOWED", "Parent Group")
    );
  }
  if (!input.isPrimaryGroup && !input.parentId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Parent Group")
    );
  }

  const allowedPryCat: AccountingPrimaryCategory[] = ["EXPENSE", "INCOME"];
  if (allowedPryCat.includes(input.primaryCategory)) {
    if (
      input.affectsGrossProfit === null ||
      input.affectsGrossProfit === undefined
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Affects Gross Profit")
      );
    }
  }
  if (!allowedPryCat.includes(input.primaryCategory)) {
    if (input.affectsGrossProfit) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_NOT_ALLOWED", "Affects Gross Profit")
      );
    }
  }

  if (input.parentId) {
    const parent = await validateIdGroup(input.parentId);
    input.primaryCategory = parent.primaryCategory;
    input.reportType = parent.reportType;
    input.nature = parent.nature;
    input.affectsGrossProfit = parent.affectsGrossProfit;
  }

  logger.info("exiting::createOrUpdateGroup::service::validation");
};

export const validateDeleteGroupServiceValidation = async (
  id: number
): Promise<void> => {
  logger.info("entering::validateDeleteGroup::service::validation");
  const group = await validateIdGroup(id);

  if (group.isReserved) {
    throw new ErrorHandler(400, generateErrorMessage("RESERVED_ITEM", "Group"));
  }

  const ledgers = await getLedgersByGroupId(id);
  if (ledgers.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("ASSOCIATED_ITEM_EXIST", "Group", "Ledger")
    );
  }
  logger.info("exiting::validateDeleteGroup::service::validation");
};
