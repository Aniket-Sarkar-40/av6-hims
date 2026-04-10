import { API_TIMEOUT } from "@repo/shared";
import {
  ApprovalInstanceByUser,
  EventInstance,
  GetMyApprovalFlow,
  IChildConfigJSON,
  ICommonApprovalUpdate,
  IParentConfigData,
  IParentConfigJSON,
  RawFlowWithSelectedStepResponse,
} from "@/types/approval/approval.js";
import { db } from "@repo/db";
import { fromTimestampToSqlDatetime, PaginatedResponse } from "av6-core";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma, PrismaClient } from "@repo/db/generated/prisma/client";

export async function findMatchingFlow(
  tx: PrismaClient | Prisma.TransactionClient,
  type: string,
  service: string,
  ccId: number,
  netTotal: number,
  level: number = 1
): Promise<RawFlowWithSelectedStepResponse | null> {
  const result = await tx.$queryRaw<
    RawFlowWithSelectedStepResponse[]
  >(Prisma.sql`
    SELECT  af.id         AS flowId,
            s.id          AS stepId,
            s.level,
            s.min_amount  AS minAmount,
            s.max_amount  AS maxAmount,
            s.step_type   AS stepType,
            af.service
    FROM    core_approval_flow               AS af
    JOIN    core_approval_step               AS s  ON s.flow_id = af.id AND s.level = ${level}
    WHERE   af.subject_type = ${type}
      AND   af.service = ${service}
      AND   af.is_active     = TRUE
      AND   s.is_active      = TRUE
      AND ( (s.step_type = 'MIN_MAX'
              AND s.min_amount <= ${netTotal}
              AND s.max_amount >= ${netTotal})
         OR (s.step_type = 'NORMAL') )
    LIMIT 1;      -- we expect exactly one matching step
  `);

  if (result.length === 0) {
    throw new ErrorHandler(400, "No matching flow found.");
  }

  // Return the first valid result (there should only be one step found in this case)
  return result[0];
}

export const getAllApprovalFlow = async ({
  staffId,
  ccId,
  pageNo = 1,
  pageSize = 10000,
  service,
  sortDir = "ASC",
  startDate,
  endDate,
  searchText,
  status = ["PENDING", "PARTIALLY_APPROVED"],
  flowType,
}: GetMyApprovalFlow): Promise<PaginatedResponse<ApprovalInstanceByUser>> => {
  logger.info("entering::getAllApprovalFlow::repository");

  const offset = (pageNo - 1) * pageSize;
  const serviceLike = `%${service}%`;
  const pattern = searchText ? `%${searchText.replace(/[%_]/g, "\\$&")}%` : "%";

  // Validate and sanitize sortDir to prevent SQL injection
  const validSortDir = sortDir === "DESC" ? "DESC" : "ASC";

  // Build base WHERE conditions
  const baseWhereConditions = Prisma.sql`
    ( cam.staff_id = ${staffId} or scc.staff_id = ${staffId} )
    and cai.status in (${Prisma.join(status)})
    and LOWER(cai.service) like LOWER(${serviceLike})
    and LOWER(cai.ref_no) like LOWER(${pattern})
    and cam.cc_id = ${ccId}
    and cai.is_active = 1 
    and cas.is_active = 1
    and cam.is_active = 1`;

  // Add date filter using parameterized queries if dates are provided
  let dateFilter = Prisma.empty;
  if (startDate && endDate) {
    const startDateTime = fromTimestampToSqlDatetime(startDate);
    const endDateTime = fromTimestampToSqlDatetime(endDate);
    dateFilter = Prisma.sql`and cai.created_at between ${startDateTime} and ${endDateTime}`;
  }
  // Add flow type filter if provided
  let flowTypeFilter = Prisma.empty;
  if (flowType) {
    flowTypeFilter = Prisma.sql`and caf.flow_type = ${flowType}`;
  }

  // Count query with consistent joins and conditions
  const countQuery = Prisma.sql`
    SELECT COUNT(DISTINCT cai.id) as total
    FROM
      core_approval_instance cai
    JOIN core_approval_step cas on cai.current_step = cas.id
    JOIN core_approval_flow caf on cas.flow_id = caf.id
    JOIN core_approver_mapping cam on cas.id = cam.step_id and cam.is_active = 1
    LEFT JOIN staff_roles sr on sr.role_id = cam.role_id
    LEFT JOIN staff_collection_center scc on (scc.collection_center_id = cam.cc_id and scc.staff_id = sr.staff_id)
    LEFT JOIN staff s on s.id = cai.created_by
    WHERE
      ${baseWhereConditions}
      ${flowTypeFilter}
      ${dateFilter}`;

  const [{ total }] = await db.$queryRaw<{ total: bigint }[]>(countQuery);

  // Return empty result if no records found instead of throwing error
  // if (Number(total) === 0) {
  //   throw new ErrorHandler(400, "No active approval instance found");
  // }

  // Main data query with consistent joins and conditions
  const dataQuery = Prisma.sql`
    SELECT DISTINCT
      cai.id,
      cai.flow_id as flowId, 
      cai.subject_type as subjectType,
      cai.service as service,
      cai.subject_id as subjectId, 
      cai.ref_no as refNo, 
      cai.current_step as currentStepId, 
      cai.net_total as netTotal, 
      cai.status,
      cai.extra,
      s.name as createdBy,
      caf.flow_type as flowType,
      caf.name as flowName, 
      cai.created_at as createdAt,
      cas.level
    FROM
      core_approval_instance cai
    JOIN core_approval_step cas on cai.current_step = cas.id
    JOIN core_approval_flow caf on cas.flow_id = caf.id
    JOIN core_approver_mapping cam on cas.id = cam.step_id and cam.is_active = 1
    LEFT JOIN staff_roles sr on sr.role_id = cam.role_id
    LEFT JOIN staff_collection_center scc on (scc.collection_center_id = cam.cc_id and scc.staff_id = sr.staff_id)
    LEFT JOIN staff s on s.id = cai.created_by
    WHERE
      ${baseWhereConditions}
      ${flowTypeFilter}
      ${dateFilter}
    GROUP BY cai.id
    ORDER BY cai.id ${Prisma.raw(validSortDir)}
    LIMIT ${pageSize}
    OFFSET ${offset}`;

  const result = await db.$queryRaw<ApprovalInstanceByUser[]>(dataQuery);

  return {
    data: result,
    totalRecords: Number(total),
    currentPageNumber: pageNo,
    lastPageNumber: Math.ceil(Number(total) / pageSize),
    pageSize,
  };
};

export async function getInstance(
  poId: number,
  subjectType: string,
  service: string
) {
  const instance = await db.approvalInstance.findFirst({
    where: {
      subjectType,
      subjectId: poId,
      service,
      status: {
        in: ["PENDING", "PARTIALLY_APPROVED"],
      },
      isActive: true,
    },
  });

  if (!instance) {
    throw new ErrorHandler(400, "No active approval instance found");
  }

  return instance;
}

export async function getAllApprovers(flowId: number, level: number) {
  logger.info(`Fetching approvers for flow ${flowId} at level ${level}`);
  return await db.approvalStep.findMany({
    where: { flowId, level, isActive: true },
  });
}

export const commonStatusUpdate = async (
  config: IParentConfigJSON,
  data: ICommonApprovalUpdate
) => {
  logger.info("entering::commonStatusUpdate::repository");

  /* Separate the table name from the dynamic column map */
  const { tableName, ...columnMap } = config;

  /* Build one `column = value` fragment per key, using parameter binding   */
  const setFragments = Object.keys(columnMap).map((key) => {
    const columnName = columnMap[key as keyof typeof columnMap] ?? ""; // e.g. "status"
    const value = data[key as keyof typeof data] ?? null; // allow NULLs
    return Prisma.sql`${Prisma.raw(columnName)} = ${value}`;
  });

  /* Assemble the final query with `Prisma.join` to avoid the trailing comma */
  const query = Prisma.sql`
     UPDATE ${Prisma.raw(tableName)}
     SET ${Prisma.join(setFragments, ", ")}
     WHERE id = ${data.id};
   `;

  await db.$queryRaw(query);

  logger.info("exiting::commonStatusUpdate::repository");
};

export const commonParentChildUpdate = async (
  config: IParentConfigJSON,
  childConfig: IChildConfigJSON | null,
  inst: EventInstance
) => {
  logger.info("entering::commonRefundUpdate::repository");

  /* Separate the table name from the dynamic column map */
  const { tableName: parentTableName, ...parentTableConfig } = config;
  const { tableName: childTableName, ...childTableConfig } = childConfig ?? {};

  const parentId = inst.subjectId;

  await db.$transaction(
    async (tx) => {
      const commonDetails = await getChildCommonDetailsByParentId(
        tx,
        parentId,
        inst.subjectType,
        inst.service
      );
      const parentDetails = await getParentCommonDetailsByParentId(
        tx,
        parentId,
        inst.subjectType,
        inst.service
      );

      if (!parentDetails) {
        return;
      }

      const parentData: IParentConfigData = {
        ...parentDetails,
        approvalNote: inst.comment || null,
        approvedAt: new Date().toISOString(),
        approvedBy: JSON.stringify(inst.approverId),
        refundAmount: parentDetails.refundAmount
          ? parentDetails.refundAmount.toNumber()
          : null,
        discountValue: parentDetails.discountValue
          ? parentDetails.discountValue.toNumber()
          : null,
        discountAmount: parentDetails.discountAmount
          ? parentDetails.discountAmount.toNumber()
          : null,
        totalCopaymentAmount: parentDetails.totalCopaymentAmount
          ? parentDetails.totalCopaymentAmount.toNumber()
          : null,
      };

      if (childTableName) {
        for (const child of commonDetails) {
          /* Build one `column = value` fragment per key, using parameter binding   */
          const setFragments = Object.keys(childTableConfig).map((key) => {
            const columnName =
              childTableConfig[key as keyof typeof childTableConfig] ?? ""; // e.g. "status"
            const value = child[key as keyof typeof child] ?? null; // allow NULLs
            return Prisma.sql`${Prisma.raw(columnName)} = ${value}`;
          });

          /* Assemble the final query with `Prisma.join` to avoid the trailing comma */
          const query = Prisma.sql`
        UPDATE ${Prisma.raw(childTableName)}
        SET ${Prisma.join(setFragments, ", ")}
        WHERE id = ${child.childId};
        `;

          await tx.$queryRaw(query);
        }
      }

      /* Build one `column = value` fragment per key, using parameter binding   */
      const setFragments = Object.keys(parentTableConfig).map((key) => {
        const columnName =
          parentTableConfig[key as keyof typeof parentTableConfig] ?? ""; // e.g. "status"
        const value = parentData[key as keyof typeof parentData] ?? null; // allow NULLs
        return Prisma.sql`${Prisma.raw(columnName)} = ${value}`;
      });

      /* Assemble the final query with `Prisma.join` to avoid the trailing comma */
      const query = Prisma.sql`
      UPDATE ${Prisma.raw(parentTableName)}
      SET ${Prisma.join(setFragments, ", ")}
      WHERE id = ${parentId};
    `;

      await tx.$queryRaw(query);

      await tx.childCommonDetails.updateMany({
        where: {
          parentId,
          subjectType: inst.subjectType,
        },
        data: {
          isActive: false,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    }
  );

  logger.info("exiting::commonRefundUpdate::repository");
};

const getChildCommonDetailsByParentId = async (
  tx: PrismaClient | Prisma.TransactionClient,
  parentId: number,
  subjectType: string,
  service: string
) => {
  return tx.childCommonDetails.findMany({
    where: {
      parentId,
      subjectType,
      service,
      isActive: true,
    },
  });
};

const getParentCommonDetailsByParentId = async (
  tx: PrismaClient | Prisma.TransactionClient,
  parentId: number,
  subjectType: string,
  service: string
) => {
  return tx.parentCommonDetails.findFirst({
    where: {
      parentId,
      subjectType,
      service,
      isActive: true,
    },
  });
};

export const getApprovalActDetailsBySubjectId = async (
  subjectId: number,
  subjectType: string,
  service: string
) => {
  return db.approvalAction.findMany({
    where: {
      approvalInstance: {
        subjectType,
        subjectId,
        service,
      },
      isActive: true,
    },
  });
};

export const getAllApprovalActDetails = async (
  subjectType: string,
  service: string
) => {
  return db.approvalAction.findMany({
    where: {
      approvalInstance: {
        subjectType,
        service,
      },
      isActive: true,
    },
    include: {
      approvalInstance: true,
    },
  });
};
