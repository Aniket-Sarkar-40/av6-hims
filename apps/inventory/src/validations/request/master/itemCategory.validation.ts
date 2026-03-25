import {
  ItemCategoryReq,
  ItemCategoryUpdate,
} from "@/types/master/itemCategory.js";
import {
  boolOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const itemCategorySchema = Joi.object<
  ItemCategoryReq | ItemCategoryUpdate
>({
  name: strRequired("Item Category Name"),

  description: strOptional("Item Category Description"),

  isAutoConsumption: boolOptional("Item Category isAutoConsumption"),
});

export const validateItemCategoryCreate = validationHandler({
  schema: itemCategorySchema,
});

export const itemCategoryUpdateSchema = itemCategorySchema.keys({
  id: idRequired("Item Category ID"),
});

export const validateItemCategoryUpdate = validationHandler({
  schema: itemCategoryUpdateSchema,
});
