import { ApprovalStatus, FlowType } from "@repo/db/generated/prisma/enums.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const commonApproveSchema = Joi.object({
  service: Joi.string().required().messages({
    "string.base": "Service must be a string",
    "any.only": "Service must be one of the allowed values",
    "any.required": "Service is required",
  }),

  subjectType: Joi.string().required().messages({
    "string.base": "Subject type must be a string",
    "any.only": "Subject type must be one of the allowed values",
    "any.required": "Subject type is required",
  }),

  id: Joi.number().integer().positive().strict().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "number.positive": "Id must be a positive number",
    "any.required": "Id is required",
  }),

  comment: Joi.string().max(500).optional().allow("", null).messages({
    "string.base": "Comment must be a string",
    "string.max": "Comment must be at most 500 characters",
  }),

  ccId: Joi.number().integer().positive().strict().required().messages({
    "number.base": "CC id must be a number",
    "number.integer": "CC id must be an integer",
    "number.positive": "CC id must be a positive number",
    "any.required": "CC id is required",
  }),

  approverId: Joi.number().integer().positive().strict().required().messages({
    "number.base": "Approver id must be a number",
    "number.integer": "Approver id must be an integer",
    "number.positive": "Approver id must be a positive number",
    "any.required": "Approver id is required",
  }),

  approveType: Joi.string().valid("APPROVE", "REJECT").required().messages({
    "string.base": "Approver type must be a string",
    "any.only": "Approver type must be one of [APPROVE, REJECT]",
    "any.required": "Approver type is required",
  }),
});

export const getMyApprovalFlowSchema = Joi.object({
  pageNo: Joi.number().integer().optional().positive().messages({
    "number.base": "pageNo must be a number",
    "number.integer": "pageNo must be an integer",
    "number.positive": "pageNo must be a positive number",
  }),
  pageSize: Joi.number().integer().optional().positive().messages({
    "number.base": "pageSize must be a number",
    "number.integer": "pageSize must be an integer",
    "number.positive": "pageSize must be a positive number",
  }),
  sortDir: Joi.string().valid("ASC", "DESC").optional().messages({
    "any.only": "sortDir must be either ASC or DESC",
    "string.base": "sortDir must be a string",
  }),
  searchText: Joi.string().optional().allow("").messages({
    "string.base": "searchText must be a string",
  }),
  startDate: Joi.string().isoDate().optional().messages({
    "string.isoDate": "startDate must be a valid ISO date string",
    "string.base": "startDate must be a string",
  }),
  endDate: Joi.string().isoDate().optional().messages({
    "string.isoDate": "endDate must be a valid ISO date string",
    "string.base": "endDate must be a string",
  }),
  staffId: Joi.number().integer().required().messages({
    "any.required": "staffId is required",
    "number.base": "staffId must be a number",
    "number.integer": "staffId must be an integer",
  }),
  ccId: Joi.number().integer().required().messages({
    "any.required": "ccId is required",
    "number.base": "ccId must be a number",
    "number.integer": "ccId must be an integer",
  }),
  service: Joi.string().optional().allow("").messages({
    "string.base": "service must be a string",
  }),
  status: Joi.array()
    .items(Joi.string().valid(...Object.values(ApprovalStatus)))
    .optional()
    .messages({
      "array.base": "status must be an array",
      "any.only": "status must contain only valid approval statuses",
    }),
  flowType: Joi.string()
    .valid(...Object.values(FlowType))
    .optional()
    .messages({
      "any.only": "flowType must contain only valid flow types",
      "string.base": "flowType must be a string",
    }),
});

export const startFlowReqSchema = Joi.object({
  service: Joi.string().required().messages({
    "string.base": `Service should be a type of text`,
    "any.required": `Service is a required field`,
  }),

  subjectType: Joi.string().required().messages({
    "string.base": `Subject Type should be a type of text`,
    "any.required": `Subject Type is a required field`,
  }),

  subjectId: Joi.number().integer().required().messages({
    "number.base": `Subject ID should be a type of number`,
    "number.integer": `Subject ID should be an integer`,
    "any.required": `Subject ID is a required field`,
  }),

  netTotal: Joi.number().required().messages({
    "number.base": `Net Total should be a type of number`,
    "any.required": `Net Total is a required field`,
  }),

  ccId: Joi.number().integer().required().messages({
    "number.base": `CC ID should be a type of number`,
    "number.integer": `CC ID should be an integer`,
    "any.required": `CC ID is a required field`,
  }),

  refNo: Joi.string().required().messages({
    "string.base": `Reference Number should be a type of text`,
    "any.required": `Reference Number is a required field`,
  }),

  level: Joi.number().integer().optional().messages({
    "number.base": `Level should be a type of number`,
    "number.integer": `Level should be an integer`,
  }),

  extra: Joi.object().optional().messages({
    "object.base": `Extra should be a type of object`,
  }),
});

export const validateStartFlowRequest = validationHandler({
  schema: startFlowReqSchema,
});

export const validateCommonApprove = validationHandler({
  schema: commonApproveSchema,
});

export const validateGetMyApprovalFlow = validationHandler({
  schema: getMyApprovalFlowSchema,
});
