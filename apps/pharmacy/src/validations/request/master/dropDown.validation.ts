import Joi from "joi";
import { DropDownName } from "@/types/master/dropDownName.js";
import { getPattern } from "av6-core";
import {
  idRequired,
  patternRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const dropDownNameSchema = Joi.object<DropDownName>({
  name: strRequired("Name", 2),

  description: strOptional("Description"),
});

export const validateDropDownName = validationHandler({
  schema: dropDownNameSchema,
});

export const dropDownNameSchemaUpdate = Joi.object<DropDownName>({
  id: idRequired("ID"),

  name: strRequired("Name", 2),

  description: strOptional("Description"),
});

export const validateDropDownNameUpdate = validationHandler({
  schema: dropDownNameSchemaUpdate,
});

export const medPackageNameSchema = Joi.object<DropDownName>({
  name: patternRequired("Name", getPattern.stringBaseNum),

  description: strOptional("Description"),
});

export const validateMedPackage = validationHandler({
  schema: medPackageNameSchema,
});

export const medPackageSchemaUpdate = Joi.object<DropDownName>({
  id: idRequired("Med package id"),

  name: patternRequired("Name", getPattern.stringBaseNum),

  description: strOptional("Description"),
});

export const validateMedPackageUpdate = validationHandler({
  schema: medPackageSchemaUpdate,
});
