import { toItemSupplierMapImportExcelEntity } from "@/mapper/itemSupplierMap/itemSupplierMap.mapper.js";
import { ItemSupplierMapImportExcelInput } from "@/types/itemSupplierMap/itemSupplierMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  arrayRequired,
  boolOptional,
  dateOptional,
  idOptional,
  idRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { numberWithMaxDecimalsRequired } from "@repo/shared/utils/joi.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import { getSchemaPrecision } from "@/utils/schema.utils.js";

export const itemSupplierMapCreateSchema = Joi.object({
  ccId: idRequired("CC Id"),

  itemId: idRequired("Item ID"),
  supplierId: idRequired("Supplier ID"),
  purchasePrice: numberWithMaxDecimalsRequired("basePrice", () =>
    getSchemaPrecision("item"),
  ),
  isLock: boolOptional("Is Lock"),
  validUpto: dateOptional("Valid Upto"),
});

export const validateCreateItemSupplierMap = validationHandler({
  schema: itemSupplierMapCreateSchema,
});

export const itemSupplierMapUpdateSchema = itemSupplierMapCreateSchema.keys({
  id: idRequired("Item Supplier ID"),
});

export const validateUpdateItemSupplierMap = validationHandler({
  schema: itemSupplierMapUpdateSchema,
});

export const itemSupplierMapImportExcelSchema =
  Joi.object<ItemSupplierMapImportExcelInput>({
    ccId: idRequired("CC Id"),
    supplierId: idRequired("Supplier ID"),
  });

export function validateImportExcelItemSupplierMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body = toItemSupplierMapImportExcelEntity(req.body);
  const { error } = itemSupplierMapImportExcelSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
}

export const bulkItemSupplierPricesSchema = Joi.object({
  supplierId: idRequired("Supplier ID"),

  itemIds: arrayRequired("Item IDs", idRequired("Item ID"), 1),

  ccId: idOptional("CC Id"),
});

export const validateBulkItemSupplierPrices = validationHandler({
  schema: bulkItemSupplierPricesSchema,
});
