import { NotificationEvent } from "@/types/approval/approval.js";
import { db } from "@repo/db";
import { Prisma } from "@repo/db/generated/prisma/client";
import { EventEmitter } from "events"; // Nodemailer or wrapper

export function registerApprovalEmailListeners(bus: EventEmitter) {
  bus.on("approval:LEVEL_READY", async (evt: NotificationEvent) => {
    const approverStaffs = evt.approvers
      .map((ap) => ap.staffId)
      .filter((id): id is number => id !== null);
    const appMapId = evt.approvers.map((ap) => ap.id);

    const directStaff =
      approverStaffs.length > 0
        ? await db.$queryRaw<
            { id: string; name: string; surname: string; email: string }[]
          >(Prisma.sql`
       select distinct  s.id, s.email, s.name, s.surname
        FROM staff s 
        inner join staff_collection_center scc on s.id = scc.staff_id 
        WHERE s.id IN (${Prisma.join(
          approverStaffs
        )}) and scc.collection_center_id = ${evt.ccId}
      `)
        : [];

    const roleStaff =
      appMapId.length > 0
        ? await db.$queryRaw<
            { id: string; name: string; surname: string; email: string }[]
          >(Prisma.sql`
        select distinct s.id, s.email, s.name, s.surname
        from core_approver_mapping cam  
        join staff_roles sr on cam.role_id = sr.role_id
        join staff_collection_center scc  on (scc.collection_center_id = cam.cc_id and scc.staff_id = sr.staff_id )
        join staff s on scc.staff_id = s.id
        where cam.id in (${Prisma.join(appMapId)});
      `)
        : [];

    const approvers = Array.from(new Set([...directStaff, ...roleStaff]));

    console.log(
      `Notifying approvers for level ${evt.level} of instance ${evt.instanceId}`,
      approvers
    );
  });

  /* Optional FYI email on completion of each level */
  // bus.on("approval:LEVEL_DONE", async (evt) => {
  //   // const requester = await getRequesterEmail(evt.instanceId);
  //   // if (!requester) return;

  // });
}
