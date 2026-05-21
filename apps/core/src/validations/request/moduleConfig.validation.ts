import { CreateOrUpdateModuleConfigReq } from "@/types/moduleConfig.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  enumRequired,
  idOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const ModuleConfigSchema = Joi.object<CreateOrUpdateModuleConfigReq>({
  id: idOptional("Id"),
  module: enumRequired("Module", ServiceCode),
  isEnabled: boolRequired("Is Active"),
});

export const CreateOrUpdateModuleConfig = Joi.object({
  data: arrayRequired("Data", ModuleConfigSchema),
});

export const validateModuleConfig = validationHandler({
  schema: CreateOrUpdateModuleConfig,
});
