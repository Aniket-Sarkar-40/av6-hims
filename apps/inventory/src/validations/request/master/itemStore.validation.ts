import { ItemStoreReq, ItemStoreUpdate } from "@/types/master/itemStore.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const itemStoreSchema = Joi.object<ItemStoreReq | ItemStoreUpdate>({
  ccId: idRequired("CC ID"),
  itemStoreName: strRequired("Item Store Name"),

  description: strOptional("Description"),

  itemStockCode: strOptional("Item Store Stock Code"),
});

export const validateItemStoreCreate = validationHandler({
  schema: itemStoreSchema,
});

export const itemStoreUpdateSchema = itemStoreSchema.keys({
  id: idRequired("Item Store ID"),
});

export const validateItemStoreUpdate = validationHandler({
  schema: itemStoreUpdateSchema,
});
