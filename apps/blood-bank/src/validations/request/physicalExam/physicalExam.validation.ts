import {
  BloodDonationPhysicalExamResponse,
  CreateOrUpdateBloodDonationPhysicalExam,
} from "@/types/bloodDonationPhysicalExam/bloodDonationPhysicalExam.js";
import {
  boolOptional,
  dateRequired,
  idOptional,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const upsertPhysicalExamSchema =
  Joi.object<CreateOrUpdateBloodDonationPhysicalExam>({
    id: idOptional("Id"),
    donorId: idRequired("Donor Id"),
    bloodBankCenterId: idRequired("Blood Bank Center Id"),
    examinedAt: dateRequired("Examined At"),
    examinedByStaffId: idRequired("Examined By Staff Id"),
    isAccepted: boolOptional("Is Accepted"),
    rejectionReason: strOptional("Rejection Reason"),
    remark: strOptional("Remarks"),
    examResponse: Joi.array()
      .items(
        Joi.object<BloodDonationPhysicalExamResponse>({
          id: idOptional("Answer Id"),
          questionId: idRequired("Question Id"),
          answerJson: strOptional("Answer Json"),
          answerValue: strOptional("Answer Value"),
        }),
      )
      .min(1)
      .required()
      .custom((value: BloodDonationPhysicalExamResponse[], helpers) => {
        const questionIds = value.map((item) => item.questionId);

        const duplicateQuestionId = questionIds.find(
          (questionId, index) => questionIds.indexOf(questionId) !== index,
        );

        if (duplicateQuestionId) {
          return helpers.error("any.custom", {
            message: "Physical Exam Question Id cannot be duplicate",
          });
        }

        return value;
      })
      .messages({
        "array.base": generateValidationErrorMessage(
          "ARRAY",
          "Physical Exam Response Data",
        ),
        "array.min": generateValidationErrorMessage(
          "MIN",
          "Physical Exam Response Data",
          "1",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Physical Exam Response Data",
        ),
      }),
  }).messages({
    "any.custom": "{{#message}}",
  });

export const validateUpsertPhysicalExam = validationHandler({
  schema: upsertPhysicalExamSchema,
});
