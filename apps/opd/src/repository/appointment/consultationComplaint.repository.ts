import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createConsultationComplaintInDb = async (
  data: CreateConsultationComplaintsInput,
) => {
  logger.info("entering::createConsultationComplaintInDb::repository");
  const store = requestStorage.getStore();
  const userId = store?.user?.id;
  const { patientId, appointmentId, complaint } = data;

  const complaintsArray = Array.isArray(complaint)
    ? complaint.map((c) => c.trim()).filter((c) => c !== "")
    : [complaint.trim()].filter((c) => c !== "");

  const result = await db.$transaction(async (tx) => {
    const existingComplaints = await tx.consultationComplaint.findMany({
      where: {
        patientId,
        appointmentId,
      },
    });

    const toCreate = complaintsArray.filter(
      (newComplaint) =>
        !existingComplaints.some((ec) => ec.complaint === newComplaint),
    );

    const toUpdate = existingComplaints.filter((ec) =>
      complaintsArray.includes(ec.complaint),
    );

    const toDeactivate = existingComplaints.filter(
      (ec) => !complaintsArray.includes(ec.complaint),
    );

    const createdComplaints = await Promise.all(
      toCreate.map((complaintText) =>
        tx.consultationComplaint.create({
          data: {
            patientId,
            appointmentId,
            complaint: complaintText,
            createdBy: userId,
            isActive: true,
          },
        }),
      ),
    );

    const updatedComplaints = await Promise.all(
      toUpdate.map((existingComplaint) =>
        tx.consultationComplaint.update({
          where: { id: existingComplaint.id },
          data: {
            isActive: true,
            updatedBy: userId,
          },
        }),
      ),
    );

    if (toDeactivate.length > 0) {
      await tx.consultationComplaint.updateMany({
        where: {
          id: {
            in: toDeactivate.map((complaint) => complaint.id),
          },
        },
        data: {
          isActive: false,
          updatedBy: userId,
        },
      });
    }

    return [...createdComplaints, ...updatedComplaints];
  });

  return result;
};
