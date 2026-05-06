import { toIncomeEntity } from "@/mapper/consumerConnect/income.mapper.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core-v2";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  dateOptional,
  idRequired,
  numberWithMaxDecimals,
  priceOptional,
  priceRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";

/**
 * Joi schema for creating a new Income.
 */
export const incomeCreateSchema = Joi.object<CreateIncomeInput>({
  incHeadId: idRequired("Income head Id"),

  name: strRequired("Name"),

  invoiceNo: strRequired("Invoice number"),

  date: dateOptional("Date"),

  amount: priceOptional("Amount"),

  note: strOptional("Note"),

  documents: Joi.string()
    .trim()
    .pattern(getPattern.imagePattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": "Documents must be a string",
    }),
});

export const incomeUpdateSchema = incomeCreateSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateIncome = validationHandler({
  schema: incomeCreateSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});

export const validateUpdateIncome = validationHandler({
  schema: incomeUpdateSchema,
  type: "FORMDATA",
  imgAttr: "documents",
});

// export const validateIncome = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   req.body = toIncomeEntity(req.body);
//   delete req.body.id;

//   const { error } = incomeCreateSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     if (req.file && req.file.path) {
//       deleteFileIfExists(req.file.path);
//     }
//     return res.status(400).json(
//       new BaseResponse({
//         success: false,
//         errorCode: "PARAMETER_INVALID",
//         errorMessage: error.message,
//         errors: error.details,
//       })
//     );
//   }

//   next();
// };

// export const validateUpdateIncome = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   req.body = toIncomeEntity(req.body);

//   const { error } = incomeUpdateSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     if (req.file && req.file.path) {
//       deleteFileIfExists(req.file.path);
//     }
//     return res.status(400).json(
//       new BaseResponse({
//         success: false,
//         errorCode: "PARAMETER_INVALID",
//         errorMessage: error.message,
//         errors: error.details,
//       })
//     );
//   }

//   next();
// };
