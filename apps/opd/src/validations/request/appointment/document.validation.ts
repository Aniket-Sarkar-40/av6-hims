import { DocumentMasterReq } from "@/types/appointment/document.js";
import { DocumentName } from "@repo/db/generated/prisma/client";
import { getPattern } from "av6-core";
import Joi from "joi";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  enumRequired,
  idRequired,
  patternRequired,
} from "@repo/shared/utils/joi.utils.js";

export const documentSchema = Joi.object<DocumentMasterReq>({
  documentType: enumRequired("Document Type", DocumentName),

  appointmentId: idRequired("Appointment Id"),
  filePath: patternRequired(
    "File Path",
    new RegExp(getPattern.imageWithOtherPattern)
  ),
});

export const validateDocumentCreate = validationHandler({
  schema: documentSchema,
  type: "FORMDATA",
  imgAttr: "filePath",
});
