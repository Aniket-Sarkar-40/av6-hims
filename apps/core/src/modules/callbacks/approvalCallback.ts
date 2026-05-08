import { approvalServiceFactory, eventBus } from "@/config/core.config.js";
import { getFlowWiseApprovalStatus } from "@/utils/approval.utils.js";
import { fromTimestampToSqlDatetime } from "@repo/shared/utils/date.utils.js";
import { EventInstance } from "av6-core-v2";

export function registerPharmacyApprovalCallbacks() {
  eventBus.on("approval:APPROVED", async (inst: EventInstance) => {
    try {
      const config = inst.step.config
        ? JSON.parse(JSON.stringify(inst.step.config))
        : null;
      const childConfig = inst.step.childConfig
        ? JSON.parse(JSON.stringify(inst.step.childConfig))
        : null;

      switch (inst.flowType) {
        case "STATUS":
          await approvalServiceFactory.commonStatusUpdate(config, {
            approvalNote: inst.comment || null,
            approvedAt: fromTimestampToSqlDatetime(new Date().toISOString()),
            approvedBy: JSON.stringify(inst.approverId),
            id: inst.subjectId,
            flowType: inst.flowType,
            status:
              getFlowWiseApprovalStatus.APPROVED[inst.service][
                inst.subjectType
              ],
          });
          break;
        default:
          await approvalServiceFactory.commonParentChildUpdate(
            config,
            childConfig,
            inst
          );
          break;
      }
    } catch (err) {
      // Don’t stop the world—log and proceed
      console.error("Pharmacy callback failed", err);
    }
  });
  eventBus.on("approval:PARTIALLY_APPROVED", async (inst: EventInstance) => {
    try {
      const config = inst.step.config
        ? JSON.parse(JSON.stringify(inst.step.config))
        : null;
      const childConfig = inst.step.childConfig
        ? JSON.parse(JSON.stringify(inst.step.childConfig))
        : null;

      switch (inst.flowType) {
        case "STATUS":
          await approvalServiceFactory.commonStatusUpdate(config, {
            approvalNote: inst.comment || null,
            approvedAt: fromTimestampToSqlDatetime(new Date().toISOString()),
            approvedBy: JSON.stringify(inst.approverId),
            id: inst.subjectId,
            status:
              getFlowWiseApprovalStatus.PARTIALLY_APPROVED[inst.service][
                inst.subjectType
              ],
            flowType: inst.flowType,
          });
          break;
        // case "REFUND":
        //   await commonParentChildUpdate(config, childConfig, inst);
        //   break;

        default:
          await approvalServiceFactory.commonParentChildUpdate(
            config,
            childConfig,
            inst
          );
          break;
      }
    } catch (err) {
      // Don’t stop the world—log and proceed
      console.error("Pharmacy callback failed", err);
    }
  });
  eventBus.on("approval:REJECTED", async (inst: EventInstance) => {
    try {
      const config = inst.step.config
        ? JSON.parse(JSON.stringify(inst.step.config))
        : null;
      const childConfig = inst.step.childConfig
        ? JSON.parse(JSON.stringify(inst.step.childConfig))
        : null;

      switch (inst.flowType) {
        case "STATUS":
          await approvalServiceFactory.commonStatusUpdate(config, {
            approvalNote: inst.comment || null,
            approvedAt: fromTimestampToSqlDatetime(new Date().toISOString()),
            approvedBy: JSON.stringify(inst.approverId),
            id: inst.subjectId,
            status:
              getFlowWiseApprovalStatus.REJECTED[inst.service][
                inst.subjectType
              ],
            flowType: inst.flowType,
          });
          break;
        // case "REFUND":
        //   await commonParentChildUpdate(config, childConfig, inst);
        //   break;

        default:
          await approvalServiceFactory.commonParentChildUpdate(
            config,
            childConfig,
            inst
          );
          break;
      }
    } catch (err) {
      // Don’t stop the world—log and proceed
      console.error("Pharmacy callback failed", err);
    }
  });
}
