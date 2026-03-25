import { getTaxDetailsByNameFromDb } from "@/repository/master/taxDetails.repository";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

import { taxDetailsService } from "@/services/master/taxDetails.service";
import { CreateOrUpdateTaxDetails } from "@/types/master/taxDetails";

export const validateIdTaxDetails = async (taxDetailsId: number) => {
  logger.info("entering::validateIdTaxDetails::service::validation");

  validIdCheck(taxDetailsId);

  const taxDetails = await taxDetailsService.getTaxDetailsById(taxDetailsId, true);
  if (!taxDetails) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tax Details"));
  }
  logger.info("exiting::validateIdTaxDetails::service::validation");

  return taxDetails;
};

export const updateIdTaxDetailsServiceValidation = async (body: CreateOrUpdateTaxDetails) => {
  logger.info("entering::updateIdTaxDetailsServiceValidation::service::validation");
  if (body.id) {
    await validateIdTaxDetails(body.id);
  }

  const taxDetailsByName = await getTaxDetailsByNameFromDb(body.name);
  if (taxDetailsByName && taxDetailsByName.id !== body.id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Tax Details Name"));
  }
  logger.info("exiting::updateIdTaxDetailsServiceValidation::service::validation");
  return;
};

export const createTaxDetailsServiceValidation = async (body: CreateOrUpdateTaxDetails) => {
  logger.info("entering::createTaxDetailsServiceValidation::service::validation");
  const taxDetailsByName = await getTaxDetailsByNameFromDb(body.name);
  if (taxDetailsByName) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Tax Details Name"));
  }
  logger.info("exiting::createTaxDetailsServiceValidation::service::validation");
  return;
};
