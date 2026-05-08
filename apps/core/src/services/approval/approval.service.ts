import { getInstance } from "@/repository/approval/approval.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { auditProxy } from "@/config/audit.config.js";
import { approvalServiceFactory } from "@/config/core.config.js";
import { db } from "@repo/db";
import { CommonApproveReq, GetMyApprovalFlow, StartFlowReq } from "av6-core-v2";

const approvalServiceRaw = {
  async approve(input: CommonApproveReq) {
    logger.info("entering::approve::service");

    const instance = await getInstance(
      input.id,
      input.subjectType,
      input.service
    );

    await approvalServiceFactory.act({
      instanceId: instance.id,
      approverId: input.approverId,
      action: input.approveType,
      ccId: input.ccId,
      comment: input.comment,
    });
    logger.info("exiting::approve::service");
  },

  async getStaffPendingApproval(input: GetMyApprovalFlow) {
    logger.info("entering::getStaffPendingApproval::service");

    const pendingApprovalInst = await approvalServiceFactory.getAllApprovalFlow(
      input
    );

    pendingApprovalInst.data = pendingApprovalInst.data.map((inst) => ({
      ...inst,
      netTotal: Number(inst.netTotal),
      extra: inst.extra ? JSON.parse(inst.extra) : null,
    }));

    logger.info("exiting::getStaffPendingApproval::service");
    return pendingApprovalInst;
  },

  async startFlow(input: StartFlowReq) {
    logger.info("entering::startFlow::service");

    await approvalServiceFactory.startFlow(db, input);

    logger.info("exiting::startFlow::service");
  },
};

export const approvalService = auditProxy.createAuditedService(
  "approval",
  approvalServiceRaw
);
