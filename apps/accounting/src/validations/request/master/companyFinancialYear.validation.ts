import {
  boolRequired,
  dateRequired,
  idRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const CompanyFinancialYearCreateSchema = Joi.object({
  companyId: idRequired("Company Id"),
  fyName: strRequired("Financial Year"),
  startDate: dateRequired("Start Date"),
  endDate: dateRequired("End Date"),
  booksBeginFrom: dateRequired("Books Begin From"),
  isCurrent: boolRequired("Is Current Financial Year"),
});

const CompanyFinancialYearUpdateSchema = CompanyFinancialYearCreateSchema.keys({
  id: idRequired("Company Financial Year Id"),
});

export const validateCreateCompanyFinancialYear = validationHandler({
  schema: CompanyFinancialYearCreateSchema,
});

export const validateUpdateCompanyFinancialYear = validationHandler({
  schema: CompanyFinancialYearUpdateSchema,
});
