import { createDocumentInDb } from "@/repository/appointment/doucment.repository.js";
import { DocumentMasterReq } from "@/types/appointment/document.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createDocumentServiceValidation } from "@/validations/service/appointment/document.service.validation.js";

export const documentService = {
  async createDocument(input: DocumentMasterReq) {
    logger.info("entering::createDocument::service");
    await createDocumentServiceValidation(input);
    const document = await createDocumentInDb(input);
    logger.info("exiting::createDocument::service");
    return document;
  },
};
