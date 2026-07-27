import Joi from "joi";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  TemplateType,
  RecipientSourceType,
} from "@repo/db/generated/prisma/client";
import {
  enumRequired,
  idOptional,
  idRequired,
} from "@repo/shared/utils/joi.utils.js";
import { MultiCreateUpdateEventRecipients } from "@/types/event/eventRecipientRule.js";

const webHardcodeItem = Joi.object({
  userId: Joi.number().integer().required(),
  level1Id: Joi.number().integer().required(),
  level2Id: Joi.number().integer().optional(),
});

const webKeyValueItem = Joi.object({
  userId: Joi.string().required(),
  level1Id: Joi.string().required(),
  level2Id: Joi.string().optional(),
});

const webStaffItem = webHardcodeItem;

const roleRuleItem = Joi.object({
  roleIds: Joi.array().items(Joi.number().integer()).min(1).required(),
  level1Ids: Joi.array().items(Joi.number().integer()).min(1).required(),
  level2Ids: Joi.array().items(Joi.number().integer()).optional(),
});

const otherHardcode = Joi.array().items(Joi.string()).required();
const otherKeyValue = Joi.array().items(Joi.string()).required();
const otherStaffs = Joi.array().items(Joi.number().integer()).required();
const otherRoles = Joi.array().items(roleRuleItem).required();

const configSchema = Joi.object({
  recipients: Joi.alternatives().conditional(Joi.ref("/templateType"), {
    is: TemplateType.WEB_NOTIFICATION,
    then: Joi.alternatives().conditional(Joi.ref("/sourceType"), [
      {
        is: RecipientSourceType.HARDCODE,
        then: Joi.array().items(webHardcodeItem).required(),
      },
      {
        is: RecipientSourceType.KEY_VALUE,
        then: Joi.array().items(webKeyValueItem).required(),
      },
      {
        is: RecipientSourceType.STAFFS,
        then: Joi.array().items(webStaffItem).required(),
      },
      {
        is: RecipientSourceType.ROLES,
        then: Joi.array().items(roleRuleItem).required(),
      },
    ]),
    otherwise: Joi.alternatives().conditional(Joi.ref("/sourceType"), [
      { is: RecipientSourceType.HARDCODE, then: otherHardcode },
      { is: RecipientSourceType.KEY_VALUE, then: otherKeyValue },
      { is: RecipientSourceType.STAFFS, then: otherStaffs },
      { is: RecipientSourceType.ROLES, then: otherRoles },
    ]),
  }),
}).required();

const getRuleSchema = (templateType: TemplateType) => {
  const isWeb = templateType === TemplateType.WEB_NOTIFICATION;

  return Joi.object({
    id: idOptional("Recipient Rule ID"),

    sourceType: enumRequired("Source Type", RecipientSourceType),

    config: Joi.when("sourceType", {
      switch: [
        {
          is: RecipientSourceType.HARDCODE,
          then: Joi.object({
            recipients: isWeb
              ? Joi.array().items(webHardcodeItem).required()
              : otherHardcode,
          }),
        },
        {
          is: RecipientSourceType.KEY_VALUE,
          then: Joi.object({
            recipients: isWeb
              ? Joi.array().items(webKeyValueItem).required()
              : otherKeyValue,
          }),
        },
        {
          is: RecipientSourceType.STAFFS,
          then: Joi.object({
            recipients: isWeb
              ? Joi.array().items(webHardcodeItem).required()
              : otherStaffs,
          }),
        },
        {
          is: RecipientSourceType.ROLES,
          then: Joi.object({
            recipients: isWeb
              ? Joi.array().items(roleRuleItem).required()
              : otherRoles,
          }),
        },
      ],
      otherwise: Joi.forbidden(),
    }),
  });
};

export const recipientRuleCreateSchema = Joi.object({
  eventConfigId: idRequired("Event Config ID"),

  templateType: enumRequired("Template Type", TemplateType),

  sourceType: enumRequired("Source Type", RecipientSourceType),

  config: configSchema,
});

export const multiCreateUpdateEventRecipientRuleSchema =
  Joi.object<MultiCreateUpdateEventRecipients>({
    eventConfigId: idRequired("Event Config ID"),

    templateType: enumRequired("Template Type", TemplateType),

    rules: Joi.array().min(1).required(),
  }).when(
    Joi.object({
      templateType: Joi.valid(TemplateType.WEB_NOTIFICATION),
    }).unknown(),
    {
      then: Joi.object({
        rules: Joi.array().items(getRuleSchema(TemplateType.WEB_NOTIFICATION)),
      }),
      otherwise: Joi.object({
        rules: Joi.array().items(getRuleSchema(TemplateType.EMAIL)), // Non-web fallback
      }),
    },
  );

export const recipientRuleUpdateSchema = recipientRuleCreateSchema.keys({
  id: idRequired("Recipient Rule ID"),
});

export const validateRecipientRuleCreate = validationHandler({
  schema: recipientRuleCreateSchema,
  type: "NORMAL",
});

export const validateRecipientRuleUpdate = validationHandler({
  schema: recipientRuleUpdateSchema,
  type: "NORMAL",
});

export const validateRecipientRuleMultiCreateUpdate = validationHandler({
  schema: multiCreateUpdateEventRecipientRuleSchema,
  type: "NORMAL",
});
