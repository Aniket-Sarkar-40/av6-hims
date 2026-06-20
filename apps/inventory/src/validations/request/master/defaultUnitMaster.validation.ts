import { DefaultUnitMasterReq } from "@/types/master/defaultUnitMaster.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const defaultUnitMasterSchema = Joi.object<DefaultUnitMasterReq>({
  name: strRequired("Name"),

  description: strOptional("Description"),
});

export const validateDefaultUnitMasterCreate = validationHandler({
  schema: defaultUnitMasterSchema,
});

export const defaultUnitMasterUpdateSchema = defaultUnitMasterSchema.keys({
  id: idRequired("Id"),
});

export const validateDefaultUnitMasterUpdate = validationHandler({
  schema: defaultUnitMasterUpdateSchema,
});
