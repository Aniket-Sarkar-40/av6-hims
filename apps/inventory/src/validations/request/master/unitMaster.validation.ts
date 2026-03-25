// validators/unitMaster.validator.ts
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster.js";
import {
  enumOptional,
  idOptional,
  idRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { DefaultUnit } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const unitMasterSchema = Joi.object<UnitMasterReq | UnitMasterUpdate>({
  packagingTypeName: strRequired("Packaging Type Name"),

  packagingSize: strRequired("Packaging Size"),

  defaultValue: idOptional("Default Value"),

  defaultUnit: enumOptional("Default Unit", DefaultUnit),
}).unknown(false);

export const validateUnitMasterCreate = validationHandler({
  schema: unitMasterSchema,
});

export const unitMasterUpdateSchema = unitMasterSchema.keys({
  id: idRequired("Id"),
});

export const validateUnitMasterUpdate = validationHandler({
  schema: unitMasterUpdateSchema,
});
