import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { InvStorage } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const storageCreateSchema = Joi.object<InvStorage>({
  name: strRequired("Storage Name"),
  description: strOptional("Storage Description"),
});

export const storageUpdateSchema = storageCreateSchema.keys({
  id: idRequired("Storage Id"),
});

export const validateStorageCreate = validationHandler({
  schema: storageCreateSchema,
});

export const validateStorageUpdate = validationHandler({
  schema: storageUpdateSchema,
});
