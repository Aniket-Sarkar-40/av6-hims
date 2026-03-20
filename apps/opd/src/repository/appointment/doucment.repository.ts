import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";

import { DocumentMasterReq } from "@/types/appointment/document.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PatientDocument } from "@repo/db/generated/prisma/client";

export const createDocumentInDb = async (input: DocumentMasterReq) => {
  logger.info("entering::createDocumentInDb::repository");
  const store = requestStorage.getStore();

  const document = await db.patientDocument.create({
    data: {
      ...input,
      createdBy: store?.user?.id,
    },
  });

  return document;
};

export const getDocumentByIdFromDb = async (
  id: number,
): Promise<PatientDocument | null> => {
  logger.info("entering::getDocumentByIdFromDb::repository");
  return db.patientDocument.findFirst({
    where: { id, isActive: true },
  });
};
