import { UINConfigDTO } from "@/types/master/uinConfig.js";
import { PmsUINConfig } from "@repo/db/generated/prisma/client";

export const toUINConfigDTO = (model: PmsUINConfig): UINConfigDTO => {
  return {
    id: model.id,
    shortCode: model.shortCode,
    sequenceNo: model.sequenceNo.toString(),
    seqResetDate: model.seqResetDate,
    seqResetPolicy: model.seqResetPolicy,
    description: model.description ?? undefined,
    uinSegments:
      typeof model.uinSegments === "string"
        ? JSON.parse(model.uinSegments)
        : [],
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    createdBy: model.createdBy,
    updatedBy: model.updatedBy ?? undefined,
  };
};
