import { PdfTemplate } from "@repo/db/generated/prisma/client";
import { toPublicImageUrl } from "@repo/shared/utils/helper.utils.js";

export const toPdfTemplateDTO = (pdfTemplate: PdfTemplate): PdfTemplate => {
  return {
    ...pdfTemplate,
    sampleImageUrl: pdfTemplate.sampleImageUrl
      ? toPublicImageUrl(pdfTemplate.sampleImageUrl)
      : null,
  };
};
