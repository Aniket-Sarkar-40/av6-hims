import {
  createItemBranchMapInput,
  GetItemBranchPricing,
  ItemBranchMap,
} from "@/types/item/itemBranchMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { TAX_METHOD } from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import {
  arrayRequired,
  dateOptional,
  enumOptional,
  idRequired,
  intOptional,
  numberArrayRequired,
  priceOptional,
} from "@repo/shared/utils/joi.utils.js";

export const getItemBranchMapSchema = Joi.object<GetItemBranchPricing>({
  branchId: Joi.number().integer().positive().required().messages({
    "any.required": "Branch Id is required",
    "number.base": "Branch Id must be a number",
    "number.integer": "Branch Id must be an integer",
    "number.positive": "Branch Id must be a positive number",
  }),

  itemId: Joi.number().integer().positive().required().messages({
    "any.required": "Item Id is required",
    "number.base": "Item Id must be a number",
    "number.integer": "Item Id must be an integer",
    "number.positive": "Item Id must be a positive number",
  }),
});

export const itemBranchMapSchema = Joi.object<
  ItemBranchMap | createItemBranchMapInput
>({
  branchId: idRequired("Branch Id"),

  itemId: idRequired("Item Id"),

  defaultDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Default Discount must be a number",
    "number.min": "Default Discount cannot be less than 0",
    "number.max": "Default Discount cannot be greater than 100",
    "number.precision": "Default Discount must have {{#limit}} decimal places",
  }),

  defaultB2BDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Default B2B Discount must be a number",
    "number.min": "Default B2B Discount cannot be less than 0",
    "number.max": "Default B2B Discount cannot be greater than 100",
    "number.precision":
      "Default B2B Discount must have {{#limit}} decimal places",
  }),

  tax: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Tax must be a number",
    "number.min": "Tax cannot be less than 0",
    "number.max": "Tax cannot be greater than 100",
    "number.precision": "Tax must have {{#limit}} decimal places",
  }),

  taxMethod: enumOptional("Tax Method", TAX_METHOD),

  purchaseAmount: intOptional("Purchase amount", 0),

  saleAmount: intOptional("Sale amount", 0),

  insurancePercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Insurance Percentage must be a number",
    "number.min": "Insurance Percentage cannot be less than 0",
    "number.max": "Insurance Percentage cannot be greater than 100",
    "number.precision":
      "Insurance Percentage must have {{#limit}} decimal places",
  }),

  walkInPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Walk In Percentage must be a number",
    "number.min": "Walk In Percentage cannot be less than 0",
    "number.max": "Walk In Percentage cannot be greater than 100",
    "number.precision":
      "Walk In Percentage must have {{#limit}} decimal places",
  }),

  onHoldSale: dateOptional("On Hold Sale"),
});

export const createItemBranchMapSchema = itemBranchMapSchema.keys({
  branchId: numberArrayRequired("Branch Id", 1),
});

export const updateItemBranchMapSchema = itemBranchMapSchema.keys({
  id: idRequired("Id"),
});

export const InputExcelItemBranchMapSchema = Joi.object({
  branchId: Joi.number().integer().required().messages({
    "number.base": "Branch Id must be a number",
    "number.integer": "Branch Id must be an integer",
    "any.required": "Branch Id is required",
  }),
  categoryId: Joi.number().integer().optional().messages({
    "number.base": "Category Id must be a number",
    "number.integer": "Category Id must be an integer",
  }),
  insurancePercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Insurance Percentage must be a number",
    "number.min": "Insurance Percentage cannot be less than 0",
    "number.precision":
      "Insurance Percentage must have {{#limit}} decimal places",
  }),
  walkInPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Walk In Percentage must be a number",
    "number.min": "Walk In Percentage cannot be less than 0",
    "number.precision":
      "Walk In Percentage must have {{#limit}} decimal places",
  }),
  tax: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Tax must be a number",
    "number.min": "Tax cannot be less than 0",
    "number.precision": "Tax must have {{#limit}} decimal places",
  }),
  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .optional()
    .messages({
      "string.base": "Tax Method must be a string",
      "any.only": `Tax Method must be one of [${Object.values(TAX_METHOD).join(
        ", ",
      )}]`,
    }),
});

export const ItemWiseUpdateDetailSchema = Joi.object({
  id: idRequired("Id"),
  branchId: idRequired("Branch Id"),
  insurancePercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Insurance Percentage must be a number",
    "number.min": "Insurance Percentage cannot be less than 0",
    "number.precision":
      "Insurance Percentage must have {{#limit}} decimal places",
  }),
  walkInPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Walk In Percentage must be a number",
    "number.min": "Walk In Percentage cannot be less than 0",
    "number.precision":
      "Walk In Percentage must have {{#limit}} decimal places",
  }),
  saleAmount: joiDecimalFromSettings({ key: "itemPrecision", min: 0 }).messages(
    {
      "number.base": "Sale Amount must be a number",
      "number.min": "Sale Amount cannot be less than 0",
      "number.precision": "Sale Amount must have {{#limit}} decimal places",
    },
  ),
})
  .or("insurancePercentage", "walkInPercentage", "saleAmount")
  .messages({
    "object.missing":
      "At least one of insurancePercentage, walkInPercentage, or saleAmount must be provided for each branch.",
  });

export const ItemWiseItemBranchMapUpdateSchema = Joi.object({
  ccId: idRequired("ccId"),
  itemId: idRequired("itemId"),
  details: arrayRequired("details", ItemWiseUpdateDetailSchema, 1),
});

export const ItemBranchMapCopySchema = Joi.object({
  ccId: Joi.number().positive().integer().required().strict().messages({
    "number.base": "ccId must be a number",
    "number.integer": "ccId must be an integer",
    "number.positive": "ccId must be a positive number",
    "any.required": "ccId is required",
  }),
  fromBranchId: Joi.number().positive().integer().required().strict().messages({
    "number.base": "From Branch Id must be a number",
    "number.integer": "From Branch Id must be an integer",
    "number.positive": "From Branch Id must be a positive number",
    "any.required": "From Branch Id is required",
  }),
  toBranchId: Joi.number().positive().integer().required().strict().messages({
    "number.base": "To Branch Id must be a number",
    "number.integer": "To Branch Id must be an integer",
    "number.positive": "To Branch Id must be a positive number",
    "any.required": "To Branch Id is required",
  }),
});

export function validateCreateItemBranchMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = createItemBranchMapSchema.validate(req.body, {
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

export function validateGetItemBranchMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = getItemBranchMapSchema.validate(req.body, {
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

export function validateUpdateItemBranchMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = updateItemBranchMapSchema.validate(req.body, {
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

export function validateInputExcelItemBranchMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = InputExcelItemBranchMapSchema.validate(req.body, {
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

export function validateItemWiseItemBranchMapUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = ItemWiseItemBranchMapUpdateSchema.validate(req.body, {
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

export function validateItemBranchMapCopy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = ItemBranchMapCopySchema.validate(req.body, {
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
