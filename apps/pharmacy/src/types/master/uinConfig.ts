// src/types/uinConfig.ts

import {
  PMS_UIN_RESET_POLICY,
  PmsUinShortCode,
  UIN_RESET_POLICY,
} from "@repo/db/generated/prisma/client";

export type UINSegmentType = "text" | "separator" | "dateFormat" | "sequenceNo";

export interface UINSegment {
  order: number;
  type: UINSegmentType;
  value?: string; // for text, separator, dateFormat
  minSeqLength?: number; // for sequenceNo
}

export interface UINPreviewRequest {
  uinSegments: UINSegment[];
}

export interface CreateUINConfigRequest {
  shortCode: PmsUinShortCode;
  seqResetPolicy: PMS_UIN_RESET_POLICY;
  description?: string;
  uinSegments: UINSegment[];
}

export interface UpdateUINConfigRequest extends CreateUINConfigRequest {
  id: number;
}

export interface UINConfigDTO {
  id: number;
  shortCode: string;
  sequenceNo: string;
  seqResetDate: Date;
  seqResetPolicy: UIN_RESET_POLICY;
  description?: string;
  uinSegments: UINSegment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
  updatedBy?: number | null;
}
