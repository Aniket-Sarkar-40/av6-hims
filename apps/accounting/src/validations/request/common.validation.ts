import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import { getPattern, ToggleActive } from "av6-core-v2";
import Joi from "joi";

export const fixedFieldSchema = Joi.alternatives()
  .try(
    Joi.object({
      type: Joi.string().valid("number").required().messages({
        "any.only": "Fixed field type must be 'number'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.number().messages({
            "number.base": "Each value in the fixed field must be a number.",
          }),
        )
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of numbers.",
          "any.required": "Fixed field value is required.",
        }),
    }),
    Joi.object({
      type: Joi.string().valid("string").required().messages({
        "any.only": "Fixed field type must be 'string'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.string().messages({
            "string.base": "Each value in the fixed field must be a string.",
          }),
        )
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of strings.",
          "any.required": "Fixed field value is required.",
        }),
    }),
    Joi.object({
      type: Joi.string().valid("boolean").required().messages({
        "any.only": "Fixed field type must be 'boolean'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.boolean().messages({
            "boolean.base": "Each value in the fixed field must be a boolean.",
          }),
        )
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of booleans.",
          "any.required": "Fixed field value is required.",
        }),
    }),
    Joi.object({
      type: Joi.string().valid("date").required().messages({
        "any.only": "Fixed field type must be 'date'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.string().messages({
            "string.base": "Each value in the fixed field must be a string.",
          }),
        )
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of strings.",
          "any.required": "Fixed field value is required.",
        }),
    }),
    Joi.object({
      type: Joi.string().valid("range").required().messages({
        "any.only": "Fixed field type must be 'range'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.string().messages({
            "string.base": "Each value in the fixed field must be a string.",
          }),
        )
        .length(2)
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of strings.",
          "any.required": "Fixed field value is required.",
          "array.length": "Fixed field value must contain exactly 2 elements.",
        }),
    }),
    Joi.object({
      type: Joi.string().valid("gt", "lt").required().messages({
        "any.only": "Fixed field type must be 'gt' or 'lt'.",
        "string.base": "Fixed field type must be a string.",
        "any.required": "Fixed field type is required.",
      }),
      value: Joi.array()
        .items(
          Joi.alternatives().try(
            Joi.string().messages({
              "string.base": "Each value in the fixed field must be a string.",
            }),
            Joi.number().messages({
              "number.base": "Each value in the fixed field must be a number.",
            }),
          ),
        )
        .length(1)
        .required()
        .messages({
          "array.base": "Fixed field value must be an array of strings.",
          "any.required": "Fixed field value is required.",
          "array.length": "Fixed field value must contain exactly 1 element.",
        }),
    }),
  )
  .messages({
    "alternatives.match": "Fixed field does not match any allowed schema.",
  });

export const fixedSearchSchema = Joi.object({
  pageNo: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page number must be a number.",
    "number.integer": "Page number must be an integer.",
    "number.min": "Page number must be at least 1.",
  }),
  pageSize: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page size must be a number.",
    "number.integer": "Page size must be an integer.",
    "number.min": "Page size must be at least 1.",
  }),
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "string.base": "Short code must be a string.",
      "any.only": `Short code must be one of [${Object.values(SHORT_CODE).join(
        ", ",
      )}].`,
      "any.required": "Short code is required.",
    }),
  searchColumns: Joi.array()
    .items(
      Joi.object({
        col: Joi.string().required().messages({
          "string.base": "Search column must be a string.",
          "any.required": "Search column is required.",
        }),
        type: Joi.string()
          .valid("string", "number", "boolean")
          .required()
          .messages({
            "any.only":
              "Search column type must be either 'string', 'number', or 'boolean'.",
            "any.required": "Search column type is required.",
          }),
      }),
    )
    .required()
    .messages({
      "array.base": "Search columns must be an array.",
      "any.required": "Search columns are required.",
    }),
  searchText: Joi.string().allow("").messages({
    "string.base": "Search text must be a string.",
  }),
  sortBy: Joi.string().required().messages({
    "string.base": "Sort by must be a string.",
    "any.required": "Sort by is required.",
  }),
  sortDir: Joi.string().valid("ASC", "DESC").required().messages({
    "any.only": "Sort direction must be either ASC or DESC.",
    "any.required": "Sort direction is required.",
  }),
  fixedSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed search must be an object with valid fixed field entries.",
    }),
  fixedNotSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed not search must be an object with valid fixed field entries.",
    }),
  includes: Joi.object().optional().messages({
    "object.base": "Includes must be an object.",
  }),
});

export const commonFetchSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),

  id: Joi.number().required().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
  includes: Joi.object().optional().messages({
    "object.base": "Includes must be an object.",
  }),
});

export const commonUpdateStatusSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),

  id: Joi.number().required().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
});

export const commonDeleteSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(SHORT_CODE))
    .required()
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),
  id: Joi.number().required().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
});

export const fixedSearchWoPaginationSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "string.base": "Short code must be a string.",
      "any.only": `Short code must be one of [${Object.values(SHORT_CODE).join(
        ", ",
      )}].`,
      "any.required": "Short code is required.",
    }),
  searchColumns: Joi.array()
    .items(
      Joi.object({
        col: Joi.string().required().messages({
          "string.base": "Search column must be a string.",
          "any.required": "Search column is required.",
        }),
        type: Joi.string()
          .valid("string", "number", "boolean")
          .required()
          .messages({
            "any.only":
              "Search column type must be either 'string', 'number', or 'boolean'.",
            "any.required": "Search column type is required.",
          }),
      }),
    )
    .required()
    .messages({
      "array.base": "Search columns must be an array.",
      "any.required": "Search columns are required.",
    }),
  searchText: Joi.string().allow("").messages({
    "string.base": "Search text must be a string.",
  }),
  sortBy: Joi.string().required().messages({
    "string.base": "Sort by must be a string.",
    "any.required": "Sort by is required.",
  }),
  sortDir: Joi.string().valid("ASC", "DESC").required().messages({
    "any.only": "Sort direction must be either ASC or DESC.",
    "any.required": "Sort direction is required.",
  }),
  fixedSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed search must be an object with valid fixed field entries.",
    }),
  fixedNotSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed not search must be an object with valid fixed field entries.",
    }),
  includes: Joi.object().optional().messages({
    "object.base": "Includes must be an object.",
  }),
});

const excelConfigItemSchema = Joi.object({
  label: Joi.string().required().messages({
    "string.base": "Label must be a string",
    "any.required": "Label is required",
  }),
  accessorKey: Joi.string().required().messages({
    "string.base": "Accessor key must be a string",
    "any.required": "Accessor key is required",
  }),
});

export const commonExcelExportSchema = fixedSearchWoPaginationSchema.keys({
  sheetName: Joi.string().required().messages({
    "string.base": "Sheet name must be a string",
    "any.required": "Sheet name is required",
  }),

  config: Joi.array().items(excelConfigItemSchema).min(1).required().messages({
    "array.base": "Config must be an array of objects",
    "array.min": "Config must contain at least one object",
    "any.required": "Config is required",
  }),

  type: Joi.string().valid("NORMAL", "GROUPED").required().messages({
    "string.base": "Type must be a string",
    "any.only": "Type must be either 'NORMAL' or 'GROUPED'",
    "any.required": "Type is required",
  }),

  // — these three become required when `type === "GROUPED"` —
  detailedConfig: Joi.array()
    .items(excelConfigItemSchema)
    .min(1)
    .messages({
      "array.base": "Detailed config must be an array of objects",
      "array.min": "Detailed config must contain at least one object",
    })
    .when("type", {
      is: "GROUPED",
      then: Joi.required().messages({
        "any.required": "Detailed config is required when type is GROUPED",
      }),
    }),

  detailAccessorKey: Joi.string()
    .messages({
      "string.base": "Detail accessor key must be a string",
    })
    .when("type", {
      is: "GROUPED",
      then: Joi.required().messages({
        "any.required": "Detail accessor key is required when type is GROUPED",
      }),
    }),

  headerAccessorKey: Joi.string()
    .messages({
      "string.base": "Header accessor key must be a string",
    })
    .when("type", {
      is: "GROUPED",
      then: Joi.required().messages({
        "any.required": "Header accessor key is required when type is GROUPED",
      }),
    }),
});

export const commonImportExcelSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),
  excelFile: Joi.string()
    .trim()
    .pattern(getPattern.xlsPattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": "Excel File must be a string",
      "string.pattern.base": "Logo must be a valid image file (Excel)",
    }),
});

export const commonExportExcelSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),
  isSample: Joi.boolean().optional().messages({
    "boolean.base": "Is Sample must be a boolean",
  }),
});

export const toggleActiveSchema = Joi.object<ToggleActive>({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),

  action: Joi.string().valid("ACTIVE", "IN_ACTIVE").required().messages({
    "string.base": "Action must be a string",
    "any.only": "Action must be either 'ACTIVE' or 'IN_ACTIVE'",
    "any.required": "Action is required",
  }),
});

export const dropdownSchema = Joi.object({
  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "string.base": "Short code must be a string.",
      "any.required": "Short code is required.",
      "any.only": `Short code must be one of [${Object.values(SHORT_CODE).join(
        ", ",
      )}].`,
    }),

  searchColumns: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "Each search column must be a string.",
      }),
    )
    .required()
    .messages({
      "array.base": "Search columns must be an array of strings.",
      "any.required": "Search columns are required.",
    }),

  searchText: Joi.string().required().allow("").messages({
    "string.base": "Search text must be a string.",
    "any.required": "Search text is required.",
  }),

  fixedSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed search must be an object with valid fixed field entries.",
    }),

  fixedNotSearch: Joi.object()
    .pattern(Joi.string(), fixedFieldSchema)
    .optional()
    .messages({
      "object.base":
        "Fixed not search must be an object with valid fixed field entries.",
    }),

  sortBy: Joi.string().optional().messages({
    "string.base": "Sort by must be a string.",
  }),

  sortDir: Joi.string().valid("ASC", "DESC").optional().messages({
    "any.only": "Sort direction must be either ASC or DESC.",
    "string.base": "Sort direction must be a string.",
  }),

  selectColumns: Joi.object().optional().messages({
    "object.base": "Select must be an object.",
  }),
});

//
// Joi schema for validating SearchRequest
//
export const searchRequestSchema = Joi.object({
  pageNo: Joi.number().integer().min(1).required().messages({
    "number.base": "Page number must be a number.",
    "number.integer": "Page number must be an integer.",
    "number.min": "Page number must be at least 1.",
    "any.required": "Page number is required.",
  }),

  pageSize: Joi.number().integer().min(1).required().messages({
    "number.base": "Page size must be a number.",
    "number.integer": "Page size must be an integer.",
    "number.min": "Page size must be at least 1.",
    "any.required": "Page size is required.",
  }),

  shortCode: Joi.string()
    .required()
    .valid(...Object.values(SHORT_CODE))
    .messages({
      "string.base": "Short code must be a string.",
      "any.only": `Short code must be one of [${Object.values(SHORT_CODE).join(
        ", ",
      )}].`,
      "any.required": "Short code is required.",
    }),

  searchColumns: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "Each search column must be a string.",
      }),
    )
    .required()
    .messages({
      "array.base": "Search columns must be an array of strings.",
      "any.required": "Search columns are required.",
    }),

  searchText: Joi.string().allow("").optional().messages({
    "string.base": "Search text must be a string.",
  }),

  sortBy: Joi.string().optional().messages({
    "string.base": "Sort by must be a string.",
  }),

  sortDir: Joi.string().valid("ASC", "DESC").optional().messages({
    "any.only": "Sort direction must be either ASC or DESC.",
    "string.base": "Sort direction must be a string.",
  }),

  includes: Joi.object().optional().messages({
    "object.base": "Includes must be an object.",
  }),
});

export const commonCreateSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(SHORT_CODE))
    .required()
    .messages({
      "any.only": "Short code must be one of the allowed values",
      "any.required": "Short code is required",
      "string.base": "Short code must be a string",
    }),
  value: Joi.string().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  description: Joi.string().optional().allow(null).messages({
    "string.base": "Description must be a string",
    "any.required": "Description is required",
  }),
});

//
// Express middleware to validate a SearchRequest
//

export const validateCommonCreate = validationHandler({
  schema: commonCreateSchema,
});
export const validateFixedSearchFetch = validationHandler({
  schema: fixedSearchSchema,
});
export const validateSearchRequest = validationHandler({
  schema: searchRequestSchema,
});
export const validateDropdownRequest = validationHandler({
  schema: dropdownSchema,
});
export const validateCommonFetch = validationHandler({
  schema: commonFetchSchema,
});
export const validateCommonUpdateStatus = validationHandler({
  schema: commonUpdateStatusSchema,
});
export const validateCommonDelete = validationHandler({
  schema: commonDeleteSchema,
});
export const validateFixedSearchWoPagination = validationHandler({
  schema: fixedSearchWoPaginationSchema,
});
export const validateCommonExcelExport = validationHandler({
  schema: commonExcelExportSchema,
});
export const validateToggleActive = validationHandler({
  schema: toggleActiveSchema,
});
export const validateCommonImportExcel = validationHandler({
  schema: commonImportExcelSchema,
});
export const validateCommonExportExcel = validationHandler({
  schema: commonExportExcelSchema,
});
