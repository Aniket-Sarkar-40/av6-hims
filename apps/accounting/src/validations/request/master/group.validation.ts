import { idRequired, strOptional } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const createGroupExcelSchema = Joi.object({
  companyId: idRequired("Company Id"),
  excelFile: strOptional("Excel File"),
});

export const validateCreateGroupExcel = validationHandler({
  schema: createGroupExcelSchema,
  path: "body",
  type: "FORMDATA",
  imgAttr: "excelFile",
});
