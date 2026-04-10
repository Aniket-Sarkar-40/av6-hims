import {
  findMatchingFlow,
  getAllApprovalFlow,
  getApprovalActDetailsBySubjectId,
  getInstance,
} from "@/repository/approval/approval.repository.js";

import EventEmitter from "events";
import {
  ApprovalAction,
  ApprovalInstance,
  ApprovalStatus,
  ApprovalStep,
  FlowType,
  Prisma,
  PrismaClient,
} from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  ActInput,
  CommonApproveReq,
  GetMyApprovalFlow,
  RawFlowWithSelectedStepResponse,
  StartFlowReq,
} from "@/types/approval/approval.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";

// approval.service.ts (simplified, omit DI boilerplate)
export default class ApprovalService {
  constructor(private prisma: PrismaClient, private eventBus: EventEmitter) {}

  async startFlow(
    tx: PrismaClient | Prisma.TransactionClient,
    {
      service,
      subjectType,
      subjectId,
      netTotal,
      ccId,
      refNo,
      level = 1,
      extra,
    }: StartFlowReq
  ): Promise<void> {
    const store = requestStorage.getStore();
    const currentUser = store?.user?.id;
    const flow = await findMatchingFlow(
      tx,
      subjectType,
      service,
      ccId,
      netTotal,
      level
    );
    if (!flow) throw new Error("No approval flow configured");

    await tx.approvalInstance.updateMany({
      where: {
        service: flow.service,
        subjectType,
        subjectId,
      },
      data: {
        isActive: false,
        updatedBy: currentUser,
      },
    });

    const inst = await tx.approvalInstance.create({
      data: {
        flowId: flow.flowId,
        service: flow.service,
        subjectType,
        subjectId,
        currentStep: flow.stepId,
        netTotal,
        refNo,
        extra,
        createdBy: currentUser,
      },
    });

    const approvers = await tx.approverMapping.findMany({
      where: { stepId: flow.stepId, ccId, isActive: true },
    });

    this.eventBus.emit("approval:LEVEL_READY", {
      instanceId: inst.id,
      subjectType: inst.subjectType,
      service: inst.service,
      subjectId: inst.subjectId,
      level: 1,
      approvers: approvers,
      ccId,
    });
  }

  async lastLevel(steps: ApprovalStep[]): Promise<number> {
    if (steps.length === 0)
      throw new Error("No steps defined in the approval flow");
    return Math.max(...steps.map((s) => s.level));
  }

  /** Approver clicks “Approve” or “Reject”. */
  async act({ instanceId, approverId, action, ccId, comment }: ActInput) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.approvalInstance.findUnique({
        where: { id: instanceId },
        include: {
          flow: {
            where: { isActive: true },
            include: { steps: { where: { isActive: true } } },
          },
        },
      });

      if (!inst) throw new ErrorHandler(400, "Approval instance not found");
      if (!inst.flow) throw new ErrorHandler(400, "Approval flow not found");

      const step = inst.flow.steps.find((s) => s.id === inst.currentStep);
      if (!step)
        throw new ErrorHandler(400, "Current step not found in the flow");

      await this.assertPermission(step, approverId, instanceId, ccId, tx); // throws if not allowed
      inst.flow.steps = inst.flow.steps.filter((s) => {
        return (
          s.stepType === "NORMAL" ||
          (s.stepType === "MIN_MAX" &&
            Number(inst.netTotal) >= Number(s.minAmount) &&
            Number(inst.netTotal) <= Number(s.maxAmount))
        );
      });
      const lastLevel = await this.lastLevel(inst.flow.steps);

      const newStatus: ApprovalStatus =
        action === "REJECT"
          ? "REJECTED"
          : step.level === lastLevel
          ? "APPROVED"
          : "PARTIALLY_APPROVED";

      await tx.approvalAction.create({
        data: {
          instanceId,
          level: step.level,
          actedBy: approverId,
          comment,
          statusAfter: newStatus,
        },
      });

      let newFlow: RawFlowWithSelectedStepResponse | null = null;
      if (newStatus === "PARTIALLY_APPROVED") {
        newFlow = await findMatchingFlow(
          tx,
          inst.flow.subjectType,
          inst.flow.service,
          ccId,
          Number(inst.netTotal || 0),
          step.level + 1
        );

        if (!newFlow) {
          throw new ErrorHandler(
            400,
            "No next step found for the approval flow"
          );
        }
      }

      const updated = await tx.approvalInstance.update({
        where: { id: instanceId },
        data: {
          currentStep:
            newStatus === "PARTIALLY_APPROVED" ? newFlow?.stepId : step.id,
          status: newStatus,
        },
      });

      // outside commit → fire callbacks
      setImmediate(() =>
        this.emitEvents(updated, inst.flow?.flowType, approverId, step, comment)
      );

      this.eventBus.emit("approval:LEVEL_DONE", {
        instanceId: inst.id,
        level: step.level,
        actedBy: approverId,
        action,
        comment,
      });

      if (newStatus === "PARTIALLY_APPROVED") {
        const nextLevel = step.level + 1;

        const approvers = await tx.approverMapping.findMany({
          where: { stepId: updated.currentStep, ccId, isActive: true },
        });

        this.eventBus.emit("approval:LEVEL_READY", {
          instanceId: inst.id,
          subjectType: inst.subjectType,
          service: inst.service,
          subjectId: inst.subjectId,
          level: nextLevel,
          approvers: approvers,
          ccId,
        });
      }

      return updated;
    });
  }

  /* ------------ private helpers ------------ */

  // private async advance(id: number, ccId: number, stepId: number, tx: PrismaClient | PrismaTransactionClient = this.prisma) {
  //   console.log(`Advancing approval instance ${id}`);

  //   // // Fetch the approval instance by its id, including associated flow steps
  //   const inst = await tx.approvalInstance.findUniqueOrThrow({
  //     where: { id },
  //     include: { flow: { include: { steps: true } } },
  //   });

  //   if (!inst) throw new ErrorHandler(400, "Approval instance not found");
  //   if (!inst.flow) throw new ErrorHandler(400, "Approval flow not found");

  //   // Get the current step for the instance
  //   let nextLevel: number;
  //   if (inst.currentLevel === 0) {
  //     nextLevel = 1;
  //   } else {
  //     const currentStep = inst.flow.steps.find((s) => s.level === inst.currentLevel);
  //     if (!currentStep) throw new Error(`Invalid level ${inst.currentLevel} for the instance`);

  //     // If this step is done (e.g., approved or rejected), move on to the next level
  //     nextLevel = inst.currentLevel + 1;
  //   }
  //   // Check if there is a next level defined
  //   const nextStep = inst.flow.steps.find((s) => s.level === nextLevel);
  //   if (nextStep) {
  //     // Update the instance to move to the next level
  //     await tx.approvalInstance.update({
  //       where: { id },
  //       data: {
  //         currentLevel: nextLevel,
  //         status: "PENDING", // Reset to "PENDING" as we are progressing the approval to the next level
  //       },
  //     });
  //     const approvers = await tx.approverMapping.findMany({
  //       where: { stepId: nextStep.id, ccId, isActive: true },
  //     });

  //     // Emit event for the next level approvers
  //     this.eventBus.emit("approval:LEVEL_READY", {
  //       instanceId: inst.id,
  //       subjectType: inst.subjectType,
  //       subjectId: inst.subjectId,
  //       level: nextLevel,
  //       approvers: approvers,
  // ccId,
  //     });
  //   } else {
  //     // If no next step, mark the instance as fully approved (completed)
  //     await tx.approvalInstance.update({
  //       where: { id },
  //       data: { status: "APPROVED" }, // or REJECTED if the final level is not approved
  //     });
  //     // Emit event for final approval
  //     this.eventBus.emit("approval:APPROVED", {
  //       instanceId: inst.id,
  //       subjectType: inst.subjectType,
  //       subjectId: inst.subjectId,
  //     });
  //   }
  // }

  private emitEvents(
    instance: ApprovalInstance,
    flowType: FlowType | undefined,
    approverId: number,
    step: ApprovalStep,
    comment?: string
  ) {
    this.eventBus.emit(`approval:${instance.status}`, {
      instanceId: instance.id,
      flowType,
      subjectId: instance.subjectId,
      approverId,
      step,
      comment,
      subjectType: instance.subjectType,
      service: instance.service,
    });
  }

  private async assertPermission(
    step: ApprovalStep,
    approverId: number,
    instanceId: number,
    ccId: number,
    tx: PrismaClient | Prisma.TransactionClient
  ): Promise<ApprovalStep> {
    const result = await tx.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    SELECT COUNT(*) AS count
    FROM (
        SELECT am.staff_id AS staff_id
        FROM core_approver_mapping am
        WHERE am.step_id = ${step.id}
          AND am.is_active = TRUE
          AND am.cc_id = ${ccId}
          AND am.staff_id = ${approverId}

        UNION

        SELECT scc.staff_id AS staff_id
        FROM core_approver_mapping am
        LEFT JOIN staff_roles sr 
          ON sr.role_id = am.role_id
        LEFT JOIN staff_collection_center scc 
          ON scc.collection_center_id = am.cc_id 
        AND scc.staff_id = sr.staff_id
        WHERE am.step_id = ${step.id}
          AND am.is_active = TRUE
          AND am.cc_id = ${ccId}
          AND scc.staff_id = ${approverId}
    ) AS staff_union; 
      `);

    if (Number(result[0].count) === 0) {
      throw new ErrorHandler(
        403,
        "You are not allowed to act on this approval step"
      );
    }

    // Check if the instance has already been acted upon for this level
    const existingActsQuery = `
      SELECT COUNT(*) AS count
      FROM core_approval_action a
      JOIN core_approval_instance ai ON ai.id = a.instance_id
      WHERE ai.id = ?
      AND a.level = ?
      AND a.acted_by = ?
      AND a.is_active = true
      AND ai.is_active = true
    `;

    const actionsResult = await tx.$queryRawUnsafe<{ count: bigint }[]>(
      existingActsQuery,
      instanceId,
      step.level,
      approverId
    );

    if (Number(actionsResult[0].count) > 0) {
      throw new ErrorHandler(
        409,
        "You have already submitted a decision for this level"
      );
    }

    // If the step is sequential, check if the previous approvers have acted
    const prevApproversQuery = `
      SELECT COUNT(*) AS count
      FROM core_approval_action a
      JOIN core_approval_instance ai ON ai.id = a.instance_id
      WHERE ai.id = ?
      AND a.level < ?
      AND a.is_active = true
      AND ai.is_active = true
      AND a.acted_by IS NOT NULL
    `;

    const prevActionsResult = await tx.$queryRawUnsafe<{ count: bigint }[]>(
      prevApproversQuery,
      instanceId,
      step.level
    );

    // If this is a sequential approval, ensure all previous levels are approved
    if (Number(prevActionsResult[0].count) !== step.level - 1) {
      throw new ErrorHandler(
        403,
        "You must wait for previous approvers to act first"
      );
    }

    return step; // Return the step if all permissions are valid
  }

  async getAllApprovalFlow(input: GetMyApprovalFlow) {
    logger.info("entering:getAllApprovalFlow --" + JSON.stringify({ input }));
    const instance = await getAllApprovalFlow(input);
    logger.info("exiting:getAllApprovalFlow --" + JSON.stringify({ instance }));

    return instance;
  }

  async getApprovalActDetailsBySubjectId(
    subjectId: number,
    subjectType: string,
    service: string
  ): Promise<ApprovalAction[]> {
    logger.info(
      "entering:getApprovalActDetailsBySubjectId --" +
        JSON.stringify({ subjectId, subjectType, service })
    );

    return getApprovalActDetailsBySubjectId(subjectId, subjectType, service);
  }

  async approve(input: CommonApproveReq) {
    logger.info("entering::approve::service");

    const instance = await getInstance(
      input.id,
      input.subjectType,
      input.service
    );

    await this.act({
      instanceId: instance.id,
      approverId: input.approverId,
      action: input.approveType,
      ccId: input.ccId,
      comment: input.comment,
    });

    // Here you would typically call the approval repository method
    // to handle the approval logic, e.g., approvalRepository.approve(approvalData);

    logger.info("exiting::approve::service");
  }

  async getStaffPendingApproval(input: GetMyApprovalFlow) {
    logger.info("entering::getStaffPendingApproval::service");

    const pendingApprovalInst = await this.getAllApprovalFlow(input);

    pendingApprovalInst.data = pendingApprovalInst.data.map((inst) => ({
      ...inst,
      netTotal: Number(inst.netTotal),
      extra: inst.extra ? JSON.parse(inst.extra) : null,
    }));

    logger.info("exiting::getStaffPendingApproval::service");
    return pendingApprovalInst;
  }
}
