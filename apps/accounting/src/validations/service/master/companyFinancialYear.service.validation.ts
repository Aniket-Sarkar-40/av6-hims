import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { getByUnique } from "@/repository/common.repository.js";
import {
  getAllCompanyFinancialYearsByCompanyIdFromDb,
  getCompanyFinancialYearByIdFromDb,
} from "@/repository/master/companyFinancialYear.repository.js";
import { CreateOrUpdateCompanyFinancialYear } from "@/types/master/companyFinancialYear.js";
import { CompanyFinancialYear } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdCompanyFinancialYear = async (
  id: number,
): Promise<CompanyFinancialYear> => {
  logger.info("entering::validateIdCompanyFinancialYear::service::validation");
  validIdCheck(id);
  const companyFinancialYear = await getCompanyFinancialYearByIdFromDb(id);

  if (!companyFinancialYear) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "CompanyFinancialYear"),
    );
  }
  logger.info("exiting::validateIdCompanyFinancialYear::service::validation");
  return companyFinancialYear;
};

export const createOrUpdateCompanyFinancialYearServiceValidation = async (
  input: CreateOrUpdateCompanyFinancialYear,
) => {
  logger.info(
    "entering::createOrUpdateCompanyFinancialYear::service::validation",
  );

  if (input.id) {
    const companyFinancialYear = await validateIdCompanyFinancialYear(input.id);
    if (companyFinancialYear?.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "Cannot update company financial year of another company",
      );
    }
  }

  await validateIdCompany(input.companyId);

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const booksBeginFrom = new Date(input.booksBeginFrom);

  const companyFinancialYear = await getByUnique({
    model: "CompanyFinancialYear",
    where: {
      fyName: input.fyName,
      companyId: input.companyId,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (companyFinancialYear) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Company Financial Year"),
    );
  }

  if (booksBeginFrom < startDate || booksBeginFrom > endDate) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_DATE_RANGE",
        "Books begin from",
        "start date",
        "end date",
      ),
    );
  }

  const existingCompanyFY = await getAllCompanyFinancialYearsByCompanyIdFromDb(
    input.companyId,
  );

  const hasOverlap = existingCompanyFY.some((fy) => {
    if (input.id && fy.id === input.id) return false;
    return !(
      endDate < new Date(fy.startDate) || startDate > new Date(fy.endDate)
    );
  });

  if (hasOverlap) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DATE_RANGE_OVERLAP",
        "Company Financial Year",
        `${input.fyName}`,
        "company",
      ),
    );
  }

  logger.info(
    "exiting::createOrUpdateCompanyFinancialYear::service::validation",
  );
};

export const validateCloseCompanyFinancialYearServiceValidation = async (
  id: number,
) => {
  logger.info(
    "entering::validateCloseCompanyFinancialYear::service::validation",
  );
  const fy = await validateIdCompanyFinancialYear(id);
  if (fy.isClosed) {
    throw new ErrorHandler(400, "Company Financial Year is already closed");
  }
  if (fy.isLocked) {
    throw new ErrorHandler(
      400,
      "Company Financial Year is locked, cannot be closed",
    );
  }
  logger.info(
    "exiting::validateCloseCompanyFinancialYear::service::validation",
  );
};

export const validateToggleLockCompanyFinancialYearServiceValidation = async (
  id: number,
) => {
  logger.info(
    "entering::validateToggleLockCompanyFinancialYear::service::validation",
  );
  const fy = await validateIdCompanyFinancialYear(id);
  // if (fy.isCurrent) {
  //   throw new ErrorHandler(400, "Current Financial Year cannot be locked");
  // }
  if (fy.isClosed) {
    throw new ErrorHandler(
      400,
      "Company Financial Year is closed, cannot be locked",
    );
  }
  const status = fy.isLocked ? false : true;
  logger.info(
    "exiting::validateToggleLockCompanyFinancialYear::service::validation",
  );
  return status;
};
