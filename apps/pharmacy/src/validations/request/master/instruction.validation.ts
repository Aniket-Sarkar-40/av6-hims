import { InstructionName } from "@/types/master/dropDownName.js";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const InstructionNameSchema = Joi.object<InstructionName>({
  instructionName: strRequired("Instruction Name", 2),
});

export const validateInstructionName = validationHandler({
  schema: InstructionNameSchema,
});

export const InstructionNameSchemaUpdate = Joi.object<InstructionName>({
  id: idRequired("Instruction Id"),

  instructionName: strRequired("Instruction Name", 2),
});

export const validateInstructionNameUpdate = validationHandler({
  schema: InstructionNameSchemaUpdate,
});
