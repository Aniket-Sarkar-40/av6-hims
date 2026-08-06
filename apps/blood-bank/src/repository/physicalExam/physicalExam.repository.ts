import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/physicalExam/physicalExam.js";
import { db } from "@repo/db/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const upsertPhysicalExamInDb = async (
  payload: CreateOrUpdateBloodDonationPhysicalExam,
): Promise<void> => {
  logger.info("entering::upsertPhysicalExamInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.$transaction(async (tx) => {
    const {
      id,
      bloodBankCenterId,
      donorId,
      examinedAt,
      examinedByStaffId,
      isAccepted,
      rejectionReason,
      remark,
      examResponse,
    } = payload;

    let physicalExamId = id;

    if (physicalExamId) {
      await tx.bloodDonationPhysicalExam.update({
        where: { id: physicalExamId },
        data: {
          bloodBankCenterId,
          donorId,
          examinedAt,
          examinedByStaffId,
          isAccepted,
          rejectionReason,
          remark,
          isActive: true,
          deletedBy: null,
          deletedAt: null,
          updatedBy: currentUser,
        },
      });
    } else {
      const createdPhysicalExam = await tx.bloodDonationPhysicalExam.create({
        data: {
          bloodBankCenterId,
          donorId,
          examinedAt,
          examinedByStaffId,
          isAccepted,
          rejectionReason,
          remark,
          isActive: true,
          createdBy: currentUser,
        },
      });

      physicalExamId = createdPhysicalExam.id;
    }

    const questionIds = examResponse.map((answer) => answer.questionId);
    const existingAnswers = await tx.bloodDonationPhysicalExamAnswer.findMany({
      where: { physicalExamId, isActive: true },
      select: { questionId: true },
    });
    const existingQuestionIds = new Set(
      existingAnswers.map((answer) => answer.questionId),
    );

    await tx.bloodDonationPhysicalExamAnswer.updateMany({
      where: {
        physicalExamId,
        isActive: true,
        ...(questionIds.length ? { questionId: { notIn: questionIds } } : {}),
      },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    const answersToCreate = examResponse.filter(
      (answer) => !existingQuestionIds.has(answer.questionId),
    );
    if (answersToCreate.length) {
      await tx.bloodDonationPhysicalExamAnswer.createMany({
        data: answersToCreate.map(({ id: _id, ...answer }) => ({
          physicalExamId: physicalExamId!,
          questionId: answer.questionId,
          answerValue: answer.answerValue ?? null,
          answerJson: answer.answerJson ?? undefined,
          remark: answer.remark ?? null,
          createdBy: currentUser,
        })),
      });
    }

    const answersToUpdate = examResponse.filter((answer) =>
      existingQuestionIds.has(answer.questionId),
    );
    if (answersToUpdate.length) {
      await Promise.all(
        answersToUpdate.map((answer) =>
          tx.bloodDonationPhysicalExamAnswer.updateMany({
            where: {
              physicalExamId,
              questionId: answer.questionId,
              isActive: true,
            },
            data: {
              answerValue: answer.answerValue ?? null,
              answerJson: answer.answerJson ?? undefined,
              remark: answer.remark ?? null,
              isActive: true,
              deletedBy: null,
              deletedAt: null,
              updatedBy: currentUser,
            },
          }),
        ),
      );
    }
  });

  logger.info("exiting::upsertPhysicalExamInDb::repository");
};
