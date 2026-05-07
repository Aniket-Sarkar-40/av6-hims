import { StoreCreateInput, StoreUpdateInput } from "@/types/master/store.js";
import {
  idOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createStoreSchema = Joi.object<
  StoreCreateInput | StoreUpdateInput
>({
  name: strRequired("Name"),
  stockCode: strOptional("Stock Code"),
  description: strOptional("Description"),
  branchId: idOptional("Branch Id"),
  wareHouseId: idOptional("Ware House Id"),
});

export const updateStoreSchema = createStoreSchema.keys({
  id: idRequired("Store Id"),
});

export const validateCreateStore = validationHandler({
  schema: createStoreSchema,
});

export const validateUpdateStore = validationHandler({
  schema: updateStoreSchema,
});
