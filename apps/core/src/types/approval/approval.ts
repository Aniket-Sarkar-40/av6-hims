import { EmployeeCache } from "@/types/staff/employee.js";
import {
  ApprovalAction,
  ApprovalFlow,
  ApprovalInstance,
  ApprovalStatus,
  ApprovalStep,
  ApproverMapping,
  FlowType,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { CommonFilterWithDate } from "av6-core";

export type LevelReadyEvt = {
  instanceId: number;
  subjectType: string;
  subjectId: number;
  level: number;
  approverIds: number[];
};

export type LevelDoneEvt = {
  instanceId: number;
  level: number;
  actedBy: number;
  action: "APPROVE" | "REJECT";
  comment?: string;
};

declare global {
  interface ApprovalEvents {
    "approval:LEVEL_READY": (e: LevelReadyEvt) => void;
    "approval:LEVEL_DONE": (e: LevelDoneEvt) => void;
    "approval:APPROVED": (i: ApprovalInstance) => void;
    "approval:REJECTED": (i: ApprovalInstance) => void;
  }
}

export interface CreateApprovalFlow {
  subjectType: string;
  name: string;
}
export interface UpdateApprovalFlow extends CreateApprovalFlow {
  id: number;
}

export interface IApprovalStep {
  id?: number;
  flowId: number;
  subjectType: string;
}

export type FlowWithStepsResponse = Prisma.ApprovalFlowGetPayload<{
  include: { steps: true };
}>;

export interface FlowWithSelectedStepResponse extends ApprovalFlow {
  step: ApprovalStep | null;
}

export interface ActInput {
  instanceId: number;
  approverId: number;
  action: "APPROVE" | "REJECT";
  ccId: number;
  comment?: string;
}

export interface RawFlowWithSelectedStepResponse {
  flowId: number;
  stepId: number;
  level: number;
  minAmount: number;
  maxAmount: number;
  stepType: string; // StepType enum as string
  ccId: number;
  service: string;
}

export interface StartFlowReq {
  service: string;
  subjectType: string;
  subjectId: number;
  netTotal: number;
  ccId: number;
  refNo: string;
  level?: number;
  extra?: Record<string, string | number | boolean | null>;
}

export interface NotificationEvent {
  instanceId: number;
  subjectType: string;
  service: string;
  subjectId: number;
  level: number;
  ccId: number;
  approvers: ApproverMapping[];
}

export interface CommonApproveReq {
  service: string;
  subjectType: string;
  id: number;
  comment?: string;
  ccId: number;
  approverId: number;
  approveType: "APPROVE" | "REJECT";
}

export interface CommonGetApprovalActionReq {
  service: string;
  subjectType: string;
  id: number;
}

export interface GetPendingApprovalReq {
  service: string;
  ccId: number;
  staffId: number;
}

export interface IParentConfigJSON {
  tableName: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNote?: string;
  status?: string;
  refundAmount?: string;
  discountType?: string;
  discountValue?: string;
  discountAmount?: string;
  totalCopaymentAmount?: string;
  isApproved?: string;
  paymentStatus?: string;
}

export interface IParentConfigData {
  approvedAt?: string | null;
  approvedBy?: string | null;
  approvalNote?: string | null;
  status?: string | null;
  refundAmount?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  totalCopaymentAmount?: number | null;
  isApproved?: string | null;
  paymentStatus?: string | null;
}

export interface IChildConfigJSON {
  tableName: string;
  discountType?: string;
  discountValue?: string;
  discountAmount?: string;
  copayValue?: string;
  copayType?: string;
  copayAmount?: string;
  coPayModificationStatus?: string;
}

export interface IChildConfigData {
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  copayValue?: number | null;
  copayType?: string | null;
  copayAmount?: number | null;
  coPayModificationStatus?: string | null;
}

export interface ICommonApprovalUpdate {
  id: number;
  flowType: FlowType;
  status?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  approvalNote?: string | null;
  refundAmount?: number | null;
}

export interface EventInstance {
  subjectType: string;
  service: string;
  instanceId: number;
  flowType: FlowType;
  subjectId: number;
  approverId: number;
  step: ApprovalStep;
  comment?: string;
}

export interface ApprovalInstanceByUser {
  id: number;
  flowId: number;
  subjectType: string;
  service: string;
  subjectId: number;
  refNo: number;
  currentStepId: number;
  netTotal: number;
  status: ApprovalStatus;
  createdBy: string;
  createdAt: Date;
  level: number;
  flowType: FlowType;
  flowName: string;
  extra?: string | null;
}

export interface ApprovalActionDto extends Omit<ApprovalAction, "actedBy"> {
  actedByDetails: EmployeeCache | null;
}

export interface GetMyApprovalFlow
  extends Omit<CommonFilterWithDate, "sortBy"> {
  staffId: number;
  ccId: number;
  service: string;
  status?: ApprovalStatus[];
  flowType?: FlowType;
}
