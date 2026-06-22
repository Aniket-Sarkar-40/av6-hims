import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { boolOptional, intOptional } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object<CreateOrUpdateSettings>({
  isCrossMatchRequired: boolOptional("Is Cross Match Required"),
  allowEmergencyIssueWithoutCrossMatch: boolOptional(
    "Allow Emergency Issue Without Cross Match"
  ),
  isTransfusionTrackingRequired: boolOptional(
    "Is Transfusion Tracking Required"
  ),
  isTransfusionVitalsRequired: boolOptional("Is Transfusion Vitals Required"),
  isTransfusionReactionRequired: boolOptional(
    "Is Transfusion Reaction Required"
  ),
  reservationExpiryMinutes: intOptional("Reservation Expiry Minutes"),
  allowReservationReversal: boolOptional("Allow Reservation Reversal"),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
