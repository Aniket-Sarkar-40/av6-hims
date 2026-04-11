import { CreateOrUpdateStaffCollectionCenter } from "@/types/staff/staffCollectionCenter.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { BinaryFlag } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { enumRequired, idRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createOrUpdateStaffCollectionCenterSchema =
  Joi.object<CreateOrUpdateStaffCollectionCenter>({
    staffId: idRequired("Staff Id"),

    collectionCenterId: idRequired("Collection Center Id"),

    isMainLab: enumRequired("Is Main Lab", { Y: "Y", N: "N" }),

    isActive: enumRequired("Is Active", BinaryFlag),
  });
export const validateStaffCollectionCenter = validationHandler({
  schema: createOrUpdateStaffCollectionCenterSchema,
});
