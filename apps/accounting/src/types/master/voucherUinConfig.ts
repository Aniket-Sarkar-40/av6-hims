import { BaseModelAttrWoCancel } from "@/types/common.js";
import { IdValue } from "@/types/global.js";
import { Prisma, VoucherUINConfig } from "@repo/db/generated/prisma/client";
import { UINSegment } from "av6-core-v2";

export interface UINPreviewRequest {
  uinSegments: UINSegment[];
}

export interface CreateOrUpdateVoucherUINConfigRequest extends Omit<
  Prisma.VoucherUINConfigUncheckedCreateInput,
  BaseModelAttrWoCancel | "uinSegments" | "sequenceNo"
> {
  uinSegments: UINSegment[];
}

export interface VoucherUINConfigDTO extends Omit<
  VoucherUINConfig,
  BaseModelAttrWoCancel | "uinSegments" | "sequenceNo"
> {
  voucherType: IdValue | null;
  sequenceNo: string;
  uinSegments: UINSegment[];
}
