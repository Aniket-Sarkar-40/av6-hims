import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import Joi from "joi";

// ---------- helpers ----------
const PresenceEnum = ["required", "optional", "forbidden"] as const;
const OpEnum = ["create", "update"] as const;
const FieldTypeEnum = [
  "string",
  "number",
  "boolean",
  "date",
  "enum",
  "object",
  "array",
  "json",
] as const;
const RelationStrategyEnum = ["create", "replace", "upsert"] as const;
const RelationKindEnum = ["many", "one"] as const;

const sourcePathSchema = Joi.string()
  // matches: body.xxx / vars.xxx / ctx.xxx (ctx.userId etc)
  .pattern(/^(body|vars|ctx)\.[A-Za-z0-9_.-]+$/)
  .messages({
    "string.base": generateValidationErrorMessage("STRING", "Source Path"),
    "string.pattern.base": generateValidationErrorMessage(
      "INVALID_FORMAT",
      "Source Path",
      "body.* | vars.* | ctx.*"
    ),
  });

const presenceByOpSchema = Joi.object({
  create: Joi.string()
    .valid(...PresenceEnum)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Presence (create)"
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Presence (create)",
        PresenceEnum.join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Presence (create)"
      ),
    }),
  update: Joi.string()
    .valid(...PresenceEnum)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Presence (update)"
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Presence (update)",
        PresenceEnum.join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Presence (update)"
      ),
    }),
})
  .required()
  .unknown(true); // allow future keys if you add more ops later

const fieldRulesSchema = Joi.object({
  min: Joi.number()
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "min"),
    }),
  max: Joi.number()
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "max"),
    }),
  integer: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "integer"),
    }),

  trim: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "trim"),
    }),
  regex: Joi.string()
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "regex"),
    }),

  values: Joi.array()
    .items(
      Joi.string()
        .required()
        .messages({
          "string.base": generateValidationErrorMessage("STRING", "Enum value"),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Enum value"
          ),
        })
    )
    .optional()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "values"),
    }),

  iso: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "iso"),
    }),

  schema: Joi.object()
    .optional()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "schema"),
    }),
})
  .optional()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage("JSON_OBJECT", "rules"),
  });

const fieldConfigSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Field name"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Field name"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Field name"),
    }),

  db: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "DB key"),
      "string.empty": generateValidationErrorMessage("EMPTY", "DB key"),
      "any.required": generateValidationErrorMessage("REQUIRED", "DB key"),
    }),

  type: Joi.string()
    .valid(...FieldTypeEnum)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Field type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Field type",
        FieldTypeEnum.join(", ")
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Field type"),
    }),

  src: sourcePathSchema.optional().messages({
    "string.base": generateValidationErrorMessage("STRING", "src"),
  }),

  presence: presenceByOpSchema,

  rules: fieldRulesSchema,

  default: Joi.any().optional(),

  allowNull: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "allowNull"),
    }),

  messages: Joi.object()
    .optional()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "messages"),
    }),
})
  .required()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage("JSON_OBJECT", "FieldConfig"),
  });

const relationWriteConfigSchema = Joi.object({
  strategy: Joi.string()
    .valid(...RelationStrategyEnum)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Relation strategy"
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Relation strategy",
        RelationStrategyEnum.join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Relation strategy"
      ),
    }),

  itemPrimaryKey: Joi.string()
    .trim()
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "itemPrimaryKey"),
    }),
})
  .required()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage(
      "JSON_OBJECT",
      "RelationWriteConfig"
    ),
  });

const relationConfigSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Relation name"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Relation name"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Relation name"
      ),
    }),

  db: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Relation db"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Relation db"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Relation db"),
    }),

  kind: Joi.string()
    .valid(...RelationKindEnum)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Relation kind"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Relation kind",
        RelationKindEnum.join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Relation kind"
      ),
    }),

  presence: presenceByOpSchema,

  write: Joi.object({
    create: relationWriteConfigSchema.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "write.create"
      ),
    }),
    update: relationWriteConfigSchema.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "write.update"
      ),
    }),
  })
    .required()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "write"),
      "any.required": generateValidationErrorMessage("REQUIRED", "write"),
    }),

  items: Joi.object({
    fields: Joi.array()
      .items(fieldConfigSchema)
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage(
          "ARRAY",
          "Relation fields"
        ),
        "array.min": generateValidationErrorMessage(
          "ARRAY_MIN_LENGTH",
          "Relation fields",
          "1"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Relation fields"
        ),
      }),

    audit: Joi.object({
      createdBy: sourcePathSchema.optional(),
      updatedBy: sourcePathSchema.optional(),
    })
      .optional()
      .unknown(true)
      .messages({
        "object.base": generateValidationErrorMessage(
          "JSON_OBJECT",
          "Relation audit"
        ),
      }),
  })
    .required()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "items"),
      "any.required": generateValidationErrorMessage("REQUIRED", "items"),
    }),
})
  //   .required()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage(
      "JSON_OBJECT",
      "RelationConfig"
    ),
  });

const uniqueWhereItemSchema = Joi.object({
  field: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Unique field"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Unique field"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Unique field"
      ),
    }),
  src: sourcePathSchema.required().messages({
    "any.required": generateValidationErrorMessage("REQUIRED", "Unique src"),
  }),
})
  .required()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage(
      "JSON_OBJECT",
      "Unique where"
    ),
  });

const uniqueConfigSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Unique name"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Unique name"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Unique name"),
    }),

  op: Joi.array()
    .items(
      Joi.string()
        .valid(...OpEnum)
        .required()
        .messages({
          "string.base": generateValidationErrorMessage("STRING", "Unique op"),
          "any.only": generateValidationErrorMessage(
            "VALID_ENUM",
            "Unique op",
            OpEnum.join(", ")
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Unique op"
          ),
        })
    )
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Unique op"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Unique op",
        "1"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Unique op"),
    }),

  where: Joi.array()
    .items(uniqueWhereItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Unique where"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Unique where",
        "1"
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Unique where"
      ),
    }),

  message: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Unique message"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Unique message"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Unique message"
      ),
    }),
})
  //   .required()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage(
      "JSON_OBJECT",
      "UniqueConfig"
    ),
  });

const includeOrSelectSchema = Joi.object()
  .optional()
  .unknown(true)
  .messages({
    "object.base": generateValidationErrorMessage(
      "JSON_OBJECT",
      "include/select"
    ),
  });

export const dynamicCrudConfigSchema = Joi.object({
  version: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Version"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Version"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Version"),
    }),

  primaryKey: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Primary Key"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Primary Key"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Primary Key"),
    }),

  validation: Joi.object({
    abortEarly: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage("BOOLEAN", "abortEarly"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "abortEarly"
        ),
      }),
    allowUnknown: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "allowUnknown"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "allowUnknown"
        ),
      }),
    stripUnknown: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "stripUnknown"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "stripUnknown"
        ),
      }),
    convert: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage("BOOLEAN", "convert"),
        "any.required": generateValidationErrorMessage("REQUIRED", "convert"),
      }),
  })
    .required()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage(
        "JSON_OBJECT",
        "validation"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "validation"),
    }),

  audit: Joi.object({
    createdByField: Joi.string()
      .trim()
      .optional()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "createdByField"
        ),
      }),
    updatedByField: Joi.string()
      .trim()
      .optional()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "updatedByField"
        ),
      }),
  })
    .optional()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "audit"),
    }),

  operations: Joi.object({
    create: Joi.object({
      requirePrimaryKey: Joi.boolean()
        .required()
        .messages({
          "boolean.base": generateValidationErrorMessage(
            "BOOLEAN",
            "requirePrimaryKey"
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "requirePrimaryKey"
          ),
        }),
    })
      .required()
      .unknown(true)
      .messages({
        "object.base": generateValidationErrorMessage(
          "JSON_OBJECT",
          "operations.create"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "operations.create"
        ),
      }),

    update: Joi.object({
      requirePrimaryKey: Joi.boolean()
        .required()
        .messages({
          "boolean.base": generateValidationErrorMessage(
            "BOOLEAN",
            "requirePrimaryKey"
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "requirePrimaryKey"
          ),
        }),
      primaryKeyFrom: Joi.string()
        .valid("params", "body", "query")
        .required()
        .messages({
          "string.base": generateValidationErrorMessage(
            "STRING",
            "primaryKeyFrom"
          ),
          "any.only": generateValidationErrorMessage(
            "VALID_ENUM",
            "primaryKeyFrom",
            "params, body, query"
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "primaryKeyFrom"
          ),
        }),
    })
      .required()
      .unknown(true)
      .messages({
        "object.base": generateValidationErrorMessage(
          "JSON_OBJECT",
          "operations.update"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "operations.update"
        ),
      }),
  })
    .required()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage(
        "JSON_OBJECT",
        "operations"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "operations"),
    }),

  uniques: Joi.array()
    .items(uniqueConfigSchema)
    .optional()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "uniques"),
    }),

  fields: Joi.array()
    .items(fieldConfigSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "fields"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "fields",
        "1"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "fields"),
    }),

  relations: Joi.array()
    .items(relationConfigSchema)
    .optional()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "relations"),
    }),

  response: Joi.object({
    include: includeOrSelectSchema,
    select: Joi.alternatives()
      .try(Joi.object().unknown(true), Joi.valid(null))
      .optional()
      .messages({
        "object.base": generateValidationErrorMessage("JSON_OBJECT", "select"),
      }),
  })
    .optional()
    .unknown(true)
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "response"),
    }),
})
  .unknown(true) // ✅ important: extra attributes should NOT give error
  .options({
    abortEarly: false,
    allowUnknown: true, // ✅ as requested
    stripUnknown: false,
    convert: true,
  });

export const updateConfigByCodeSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(SHORT_CODE))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "short Code"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "short Code",
        Object.values(SHORT_CODE).join(", ")
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "short Code"),
    }),

  config: dynamicCrudConfigSchema.required().messages({
    "object.base": generateValidationErrorMessage("JSON_OBJECT", "Config"),
    "any.required": generateValidationErrorMessage("REQUIRED", "Config"),
  }),
});

export const validateUpdateConfigByCode = validationHandler({
  schema: updateConfigByCodeSchema,
  type: "NORMAL",
  allowUnknown: true,
});
