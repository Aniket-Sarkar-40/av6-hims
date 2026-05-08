import { toItemEntity, toItemUpdateEntity } from "@/mapper/item/item.mapper.js";
import {
  CreateItemInput,
  CreateItemSearch,
  GetItemReq,
  ItemFilter,
  ItemImageFiles,
  UpdateItemInput,
} from "@/types/item/item.js";
import {
  CreateItemDosageMap,
  CreateItemInstructionMap,
} from "@/types/item/itemDosageMap.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
// import { validIdCheck } from "@/validations/global.validation.js";
import {
  ItemExcel,
  PmsItemStatus,
  PmsMedPackType,
  Prisma,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { getPattern } from "av6-core-v2";

// Common validation schema for both create and update inputs
const commonItemSchema = Joi.object<CreateItemInput | UpdateItemInput>({
  itemNumber: Joi.string().optional().allow(null).trim().strict().messages({
    "string.base": `Item Number must be a string`,
    "string.empty": `Item Number cannot be empty`,
    "string.trim": `Item Number cannot contains extra spaces`,
  }),

  medicineName: Joi.string().required().messages({
    "string.base": `Medicine Name must be a string`,
    "string.empty": `Medicine Name cannot be empty`,
    "any.required": `Medicine Name is required`,
  }),

  medCategoryId: Joi.number().integer().required().messages({
    "number.base": `Medicine Category Id must be a number`,
    "number.integer": `Medicine Category Id must be an integer`,
    "any.required": `Medicine Category Id is required`,
  }),

  medTypeId: Joi.number().integer().required().messages({
    "number.base": `Medicine Type Id must be a number`,
    "number.integer": `Medicine Type Id must be an integer`,
    "any.required": `Medicine Type Id is required`,
  }),
  storageId: Joi.number().integer().optional().allow(null).messages({
    "number.base": `Storage Type Id must be a number`,
    "number.integer": `Storage Type Id must be an integer`,
  }),

  medCompId: Joi.number().integer().required().messages({
    "number.base": `Medicine Composition Id must be a number`,
    "number.integer": `Medicine Composition Id must be an integer`,
    "any.required": `Medicine Composition Id is required`,
  }),

  medUnitId: Joi.number().integer().required().messages({
    "number.base": `Medicine Unit Id must be a number`,
    "number.integer": `Medicine Unit Id must be an integer`,
    "any.required": `Medicine Unit Id is required`,
  }),

  boxSizeId: Joi.number().integer().optional().allow(null).messages({
    "number.base": `Box Size Id must be a number`,
    "number.integer": `Box Size Id must be an integer`,
  }),

  medManufacturerId: Joi.number().integer().required().messages({
    "number.base": `Medicine Manufacturer Id must be a number`,
    "number.integer": `Medicine Manufacturer Id must be an integer`,
    "any.required": `Medicine Manufacturer Id is required`,
  }),

  packSizeId: Joi.number().integer().required().messages({
    "number.base": `Pack Size Id must be a number`,
    "number.integer": `Pack Size Id must be an integer`,
    "any.required": `Pack Size Id is required`,
  }),

  drugTypeId: Joi.number().integer().required().messages({
    "number.base": `Drug Type Id must be a number`,
    "number.integer": `Drug Type Id must be an integer`,
    "any.required": `Drug Type Id is required`,
  }),

  purchaseAmount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Purchase Amount must be a number`,
    "any.required": `Purchase Amount is required`,
    "number.min": `Purchase Amount must be at least 0`,
    "number.precision": `Purchase Amount must have {{#limit}} decimal places`,
  }),

  saleAmount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Sale Amount must be a number`,
    "any.required": `Sale Amount is required`,
    "number.min": `Sale Amount must be at least 0`,
    "number.precision": `Sale Amount must have {{#limit}} decimal places`,
  }),

  medPackingType: Joi.string()
    .valid(...Object.values(PmsMedPackType))
    .required()
    .messages({
      "any.only": `Medicine Packing Type must be one of [${Object.values(
        PmsMedPackType
      ).join(", ")}]`,
      "any.required": `Medicine Packing Type is required`,
    }),

  defaultDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).messages({
    "number.base": `Default Discount must be a number`,
    "number.precision": `Default Discount must have {{#limit}} decimal places`,
    "any.required": `Default Discount is required`,
  }),

  defaultB2BDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).messages({
    "number.base": `Default B2B Discount must be a number`,
    "number.precision": `Default B2B Discount must have {{#limit}} decimal places`,
    "any.required": `Default B2B Discount is required`,
  }),

  isLockDiscount: Joi.boolean().required().messages({
    "boolean.base": `Is Lock Discount must be a boolean`,
    "any.required": `Is Lock Discount is required`,
  }),

  isLockB2BDiscount: Joi.boolean().required().messages({
    "boolean.base": `Is Lock B2B Discount must be a boolean`,
    "any.required": `Is Lock B2B Discount is required`,
  }),

  minStock: Joi.number().integer().required().messages({
    "number.base": `Minimum Stock must be a number`,
    "number.integer": `Minimum Stock must be an integer`,
    "any.required": `Minimum Stock is required`,
  }),

  maxStock: Joi.number().integer().required().messages({
    "number.base": `Maximum Stock must be a number`,
    "number.integer": `Maximum Stock must be an integer`,
    "any.required": `Maximum Stock is required`,
  }),

  tax: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).messages({
    "number.base": `Tax must be a number`,
    "number.precision": `Tax must have {{#limit}} decimal places`,
    "any.required": `Tax is required`,
  }),

  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .messages({
      "any.only": `Tax Method must be one of [${Object.values(TAX_METHOD).join(
        ", "
      )}]`,
      "any.required": `Tax Method is required`,
    }),

  isAllowLooseSale: Joi.boolean().required().messages({
    "boolean.base": `Is Allow Loose Sale must be a boolean`,
    "any.required": `Is Allow Loose Sale is required`,
  }),

  acceptOnlineOrder: Joi.boolean().required().messages({
    "boolean.base": `Accept Online Order must be a boolean`,
    "any.required": `Accept Online Order is required`,
  }),

  isReturnable: Joi.boolean().required().messages({
    "boolean.base": `Is Returnable must be a boolean`,
    "any.required": `Is Returnable is required`,
  }),

  isSuggestionLock: Joi.boolean().required().messages({
    "boolean.base": `Is Suggestion Lock must be a boolean`,
    "any.required": `Is Suggestion Lock is required`,
  }),

  status: Joi.string()
    .valid(...Object.values(PmsItemStatus))
    .required()
    .messages({
      "any.only": `Status must be one of [${Object.values(PmsItemStatus).join(
        ", "
      )}]`,
      "any.required": `Status is required`,
    }),

  cess: Joi.number().optional().allow(null).messages({
    "number.base": `Cess must be a number`,
  }),

  hsnCode: Joi.string().optional().allow(null, "").messages({
    "string.base": `HSNCODE must be a string`,
  }),

  minOrderDetails: Joi.string().optional().allow(null, "").messages({
    "string.base": `Minimum Order Details must be a string`,
  }),

  rackLocation: Joi.string().optional().allow(null, "").messages({
    "string.base": `Rack Location must be a string`,
  }),

  remark: Joi.string().optional().allow(null, "").messages({
    "string.base": `Remark must be a string`,
  }),

  onHoldSale: Joi.date().optional().allow(null).messages({
    "date.base": `On Hold Sale must be a date`,
  }),

  barcode: Joi.string().optional().allow(null, "").messages({
    "string.base": `Barcode must be a string`,
  }),

  itemAlias: Joi.string().optional().allow(null, "").messages({
    "string.base": `Item Alias must be a string`,
  }),

  tags: Joi.string().optional().allow(null, "").messages({
    "string.base": `Tags must be a string`,
  }),
  insurancePercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Insurance Percentage must be a number`,
    "number.min": `Insurance Percentage must be at least 0%`,
    "number.precision": `Insurance Percentage must have {{#limit}} decimal places`,
    "any.required": `Insurance Percentage is required`,
  }),
  walkInPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Walk In Percentage must be a number`,
    "number.min": `Walk In Percentage must be at least 0%`,
    "number.precision": `Walk In Percentage must have {{#limit}} decimal places`,
    "any.required": `Walk In Percentage is required`,
  }),
});

// Image validation schema remains unchanged
const imageSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": `Images.name must be a string`,
    "string.empty": `Images.name cannot be empty`,
    "any.required": `Images.name is required`,
  }),
  url: Joi.string()
    .trim()
    .pattern(getPattern.imagePattern)
    .required()
    .messages({
      "string.base": "Images.url must be a string",
      "string.pattern.base":
        "Images.url must be a valid image file (jpeg, jpg, png, or gif)",
      "any.required": `Images.url is required`,
    }),
  isPrimary: Joi.boolean().optional().messages({
    "boolean.base": `Images.isPrimary must be a boolean`,
  }),
}).messages({
  "object.base": `Images items must be objects`,
});

// Create schema
export const createItemSchema = commonItemSchema.keys({
  images: Joi.array().items(imageSchema).optional().messages({
    "array.base": `Images must be an array of image objects`,
  }),
});

// Update schema extends create schema with required id
export const updateItemSchema = createItemSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const commonItemDosageSchema = Joi.object<CreateItemDosageMap>({
  itemId: Joi.number().integer().required().messages({
    "number.base": `Item Id must be a number`,
    "number.integer": `Item Id must be an integer`,
    "any.required": `Item Id is required`,
  }),

  dosageId: Joi.number().integer().required().messages({
    "number.base": `Dosage Id must be a number`,
    "number.integer": `Dosage Id must be an integer`,
    "any.required": `Dosage Id is required`,
  }),
  qty: Joi.number().integer().min(0).required().messages({
    "number.base": `Quantity must be a number`,
    "number.integer": `Quantity must be an integer`,
    "any.required": `Quantity is required`,
    "number.min": "Quantity must be greater than or equal to 0",
  }),
});
export const commonItemInstructionSchema = Joi.object<CreateItemInstructionMap>(
  {
    itemId: Joi.number().integer().required().messages({
      "number.base": `Item Id must be a number`,
      "number.integer": `Item Id must be an integer`,
      "any.required": `Item Id is required`,
    }),

    instructionId: Joi.number().integer().required().messages({
      "number.base": `Dosage Id must be a number`,
      "number.integer": `Dosage Id must be an integer`,
      "any.required": `Dosage Id is required`,
    }),
  }
);

// Update schema extends create schema with required id
export const updateItemDosageMapSchema = commonItemDosageSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});
export const updateItemInstructionMapSchema = commonItemInstructionSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const createItemSearchSchema = Joi.object<CreateItemSearch>({
  searchText: Joi.string().trim().min(2).required().messages({
    "string.base": "Search text must be a string",
    "any.required": "Search text is required",
    "string.min": "Search text length must be at least 2 characters long",
  }),

  medTypeId: Joi.number().integer().strict().optional().messages({
    "number.base": "Medicine Type Id must be a number",
    "number.integer": "Medicine Type Id must be an integer",
  }),

  medCompId: Joi.number().integer().strict().optional().messages({
    "number.base": "Medicine Composition Id must be a number",
    "number.integer": "Medicine Composition  must be an integer",
  }),

  medUnitId: Joi.number().integer().strict().optional().messages({
    "number.base": "Medicine Unit Id must be a number",
    "number.integer": "Medicine Unit Id must be an integer",
  }),

  packSize: Joi.number().integer().strict().optional().messages({
    "number.base": "Pack Size must be a number",
    "number.integer": "Pack Size must be an integer",
  }),

  drugType: Joi.number().integer().strict().optional().messages({
    "number.base": "Drug Type must be a number",
    "number.integer": "Drug Type must be an integer",
  }),

  medManufacturer: Joi.number().integer().strict().optional().messages({
    "number.base": "Medicine Manufacturer must be a number",
    "number.integer": "Medicine Manufacturer must be an integer",
  }),

  medCategoryId: Joi.number().integer().strict().optional().messages({
    "number.base": "Medicine Category Id must be a number",
    "number.integer": "Medicine Category Id must be an integer",
  }),

  status: Joi.string()
    .valid(...Object.values(PmsItemStatus))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of: ${Object.values(PmsItemStatus).join(
        ", "
      )}`,
    }),
});

export const getItemStockReqSchema = Joi.object<GetItemReq>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": `"Id" must be a number`,
    "number.integer": `"Id" must be an integer`,
    "any.required": `"Id" is required`,
  }),
  warehouseId: Joi.number().integer().optional().strict().messages({
    "number.base": `"Warehouse Id" must be a number`,
    "number.integer": `"Warehouse Id" must be an integer`,
  }),
  branchId: Joi.number().integer().optional().strict().messages({
    "number.base": `"Branch Id" must be a number`,
    "number.integer": `"Branch Id" must be an integer`,
  }),
  insuranceId: Joi.number().integer().optional().strict().messages({
    "number.base": `"Insurance Id" must be a number`,
    "number.integer": `"Insurance Id" must be an integer`,
  }),
  corporateClientId: Joi.number().integer().optional().strict().messages({
    "number.base": `"Corporate Client Id" must be a number`,
    "number.integer": `"Corporate Client Id" must be an integer`,
  }),
  isZeroQty: Joi.boolean().optional().strict().messages({
    "boolean.base": `Is zero quantity must be a boolean`,
  }),
  isCustomPricing: Joi.boolean().optional().strict().messages({
    "boolean.base": `Is custom pricing must be a boolean`,
  }),
  isItemBranchMap: Joi.boolean().optional().strict().messages({
    "boolean.base": `Is item branch map must be a boolean`,
  }),
});

export const itemExcelSchema = Joi.object({
  rowNo: Joi.number().integer().optional().label("row no"),

  itemNumber: Joi.string().allow(null, "").optional().label("item number"),

  medicineName: Joi.string().required().label("medicine name"),

  medCategory: Joi.string().required().label("medicine category"),

  medType: Joi.string().required().label("medicine type"),

  medComp: Joi.string().required().label("medicine composition"),

  medUnit: Joi.string().required().label("medicine unit"),

  boxSize: Joi.string().allow(null, "").optional().label("box size"),

  manufacturer: Joi.string().required().label("manufacturer"),

  minOrderDetails: Joi.string()
    .allow(null, "")
    .optional()
    .label("min order details"),

  rackLocation: Joi.string().allow(null, "").optional().label("rack location"),

  defaultDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).label("default discount"),

  defaultB2BDiscount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).label("default b2b discount"),

  // These have DB defaults, so in API they can be optional but must be boolean if present
  isLockDiscount: Joi.boolean().optional().label("is lock discount"),

  isLockB2BDiscount: Joi.boolean().optional().label("is lock b2b discount"),

  minStock: Joi.number().integer().required().label("min stock"),

  maxStock: Joi.number().integer().required().label("max stock"),

  tax: joiDecimalFromSettings({ key: "itemPrecision", required: true }).label(
    "tax"
  ),

  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .label("tax method"),

  packSize: Joi.string().required().label("pack size"),

  drugType: Joi.string().required().label("drug type"),

  isAllowLooseSale: Joi.boolean().optional().label("is allow loose sale"),

  acceptOnlineOrder: Joi.boolean().optional().label("accept online order"),

  isReturnable: Joi.boolean().optional().label("is returnable"),

  isSuggestionLock: Joi.boolean().optional().label("is suggestion lock"),

  cess: Joi.number().allow(null).optional().label("cess"),

  hsnCode: Joi.string().allow(null, "").optional().label("hsn code"),

  status: Joi.string()
    .valid(...Object.values(PmsItemStatus))
    .optional()
    .label("status"),

  purchaseAmount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).label("purchase amount"),

  saleAmount: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
    min: 0,
  }).label("sale amount"),

  remark: Joi.string().allow(null, "").optional().label("remark"),

  onHoldSale: Joi.date().allow(null).optional().label("on hold sale"),

  medPackingType: Joi.string()
    .valid(...Object.values(PmsMedPackType))
    .required()
    .label("medicine pack type"),

  barcode: Joi.string().allow(null, "").optional().label("barcode"),

  itemAlias: Joi.string().allow(null, "").optional().label("item alias"),

  tags: Joi.string().allow(null, "").optional().label("tags"),

  insurancePercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).label("insurance percentage"),

  walkInPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    required: true,
  }).label("walk in percentage"),

  batchNo: Joi.string().allow(null, "").optional().label("batch no"),

  expiryDate: Joi.date().allow(null).optional().label("expiry date"),

  quantity: Joi.number().integer().allow(null).optional().label("quantity"),
})
  // Common messages – will use the .label() values like "item alias", "medicine name", etc.
  .messages({
    "any.required": "{#label} is required",
    "any.only": "{#label} must be one of {#valids}",
    "number.base": "{#label} must be a number",
    "number.integer": "{#label} must be an integer",
    "string.base": "{#label} must be a string",
    "boolean.base": "{#label} must be a boolean",
    "date.base": "{#label} must be a valid date",
  });

// Schema for ARRAY of items
export const itemExcelArraySchema = Joi.array()
  .items(itemExcelSchema)
  .min(1)
  .required()
  .label("items")
  .messages({
    "array.base": "{#label} must be an array of items",
    "array.min": "{#label} must contain at least one item",
  });

export function validateItemExcelArray(input: unknown): {
  value: Omit<Prisma.ItemExcelCreateInput, "batchJob">[];
} {
  const { value, error } = itemExcelArraySchema.validate(input, {
    abortEarly: false,
  });

  if (!error) {
    return { value };
  }

  const asArray: unknown[] = Array.isArray(input) ? input : [];
  let errorMessage = "";

  const errorDetailed = error.details.map((detail) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [maybeIndex, ...restPath] = detail.path;

    let prefix = "";

    if (typeof maybeIndex === "number") {
      const item = asArray[maybeIndex] as Partial<ItemExcel> | undefined;
      const rowNo = item?.rowNo;
      const rowDisplay = rowNo ?? maybeIndex + 1; // fallback to index+1
      prefix = `Row ${rowDisplay}: `;
    }

    errorMessage += prefix + detail.message + "\n";

    return {
      ...detail,
      message: prefix + detail.message,
    };
  });

  throw new ErrorHandler(400, errorMessage, errorDetailed);
}

// 3) Middleware to validate CreateItemInput
export function validateCreateItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body = toItemEntity(req.body, req.files as ItemImageFiles);

  const { error } = createItemSchema.validate(req.body, {
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
      })
    );
  }

  next();
}
export function validateCreateItemDosageMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = commonItemDosageSchema.validate(req.body, {
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
      })
    );
  }

  next();
}
export function validateCreateItemInstructionMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = commonItemInstructionSchema.validate(req.body, {
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
      })
    );
  }

  next();
}
export function validateUpdateItemDosageMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateItemDosageMapSchema.validate(req.body, {
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
      })
    );
  }
  next();
}
export function validateUpdateItemInstructionMap(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateItemInstructionMapSchema.validate(req.body, {
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
      })
    );
  }
  next();
}

export function validateUpdateItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // validIdCheck(itemId);
  req.body = toItemUpdateEntity(req.body, req.files as ItemImageFiles);

  const { error } = updateItemSchema.validate(req.body, {
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
      })
    );
  }

  next();
}

export function validateItemSearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createItemSearchSchema.validate(req.body, {
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
      })
    );
  }

  next();
}

export function validateItemStock(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = getItemStockReqSchema.validate(req.body, {
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
      })
    );
  }

  next();
}

export const itemFilterSchema = Joi.object<ItemFilter>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  medCategoryId: Joi.number().integer().optional().strict().messages({
    "number.base": "Medical Category ID must be a number",
    "number.integer": "Medical Category ID must be an integer",
  }),

  medTypeId: Joi.number().integer().optional().strict().messages({
    "number.base": "Medical Type ID must be a number",
    "number.integer": "Medical Type ID must be an integer",
  }),

  medUnitId: Joi.number().integer().optional().strict().messages({
    "number.base": "Medical Unit ID must be a number",
    "number.integer": "Medical Unit ID must be an integer",
  }),

  status: Joi.string()
    .valid(...Object.values(PmsItemStatus))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(PmsItemStatus).join(
        ", "
      )}`,
    }),
});

export const validateItemExcelFilter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = itemFilterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
