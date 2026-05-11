import {
  getCompanyByCode,
  getCompanyById,
  getCompanyFYByCompanyAndDateRange,
  getFyByIdFromDb,
} from "@/repository/company/company.repository.js";
import { commonGetService } from "@/services/common.service.js";
import {
  CompanyResponse,
  CreateOrUpdateCompanyInput,
} from "@/types/company/company.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  CompanyFinancialYear,
  GstRegistrationType,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdCompany = async (
  id: number
): Promise<CompanyResponse> => {
  logger.info("entering::validateIdCompany::service::validation");
  validIdCheck(id);
  const company = await getCompanyById(id);

  if (!company) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Company"));
  }
  logger.info("exiting::validateIdCompany::service::validation");
  return company;
};
export const validateIdFinancialYear = async (
  id: number
): Promise<CompanyFinancialYear> => {
  logger.info("entering::validateIdFinancialYear::service::validation");
  validIdCheck(id);
  const fy = await getFyByIdFromDb(id);

  if (!fy) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Financial Year")
    );
  }
  logger.info("exiting::validateIdFinancialYear::service::validation");
  return fy;
};

export const createOrUpdateCompanyServiceValidation = async (
  input: CreateOrUpdateCompanyInput
) => {
  logger.info("entering::createOrUpdateCompany::service::validation");
  const { addresses, statutory, financialYears, currencySettings, features } =
    input;
  if (input.id) {
    const company = await validateIdCompany(input.id);
    input.existing = company;
    const companyFy = await getCompanyFYByCompanyAndDateRange(
      input.id,
      new Date(financialYears.startDate),
      new Date(financialYears.endDate)
    );
    if (companyFy) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Company Financial Year")
      );
    }
    for (const address of addresses) {
      const compId = company.companyAddresses.find(
        (a) => a.id === address.id
      )?.companyId;
      if (compId !== input.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ASSOCIATION", "Address", "Company")
        );
      }
    }
    if (company.companyStatutory?.id !== statutory.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Statutory", "Company")
      );
    }
    const fyCompId = company.companyFinancialYears?.find(
      (fy) => fy.id === financialYears.id
    )?.companyId;
    if (fyCompId !== input.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company")
      );
    }
    if (company.companyCurrencySettings?.id !== currencySettings.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_ASSOCIATION",
          "Currency Settings",
          "Company"
        )
      );
    }
    if (company.companyFeatures?.id !== features.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Features", "Company")
      );
    }
  }

  const sameCode = await getCompanyByCode(input.code, input.id);
  if (sameCode) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Company Code")
    );
  }

  for (const address of addresses) {
    const city = await commonGetService.getElementById<"City">({
      cacheCode: "CITY",
      canNullReturnable: true,
      id: address.cityId,
      modelName: "City",
      shortCode: "CITY",
      useActiveFlag: true,
    });

    if (!city) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "City"));
    }
    if (city.stateId !== address.stateId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "City", "State")
      );
    }
    if (city.countryId !== address.countryId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "City", "Country")
      );
    }
  }

  const allowedGstRegType = new Set<GstRegistrationType>([
    GstRegistrationType.REGULAR,
    GstRegistrationType.COMPOSITION,
    GstRegistrationType.SEZ,
  ]);
  if (statutory.isGstEnabled) {
    if (!statutory.gstRegistrationType) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Gst Registration Type")
      );
    }
    if (allowedGstRegType.has(statutory.gstRegistrationType)) {
      if (!statutory.gstin) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Gst In")
        );
      }
      if (!statutory.gstStateCode) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Gst State Code")
        );
      }
      if (!statutory.gstEffectiveFrom) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Gst Effective From")
        );
      }
    }
  }

  logger.info("exiting::createOrUpdateCompany::service::validation");
};
