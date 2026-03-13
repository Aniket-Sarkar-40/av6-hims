import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { pdfTemplateService } from "@/services/pdf/pdfTemplate.service.js";
import {
  CreatePdfTemplateInput,
  MakeDefaultPdfTemplateInput,
  UpdatePdfTemplateInput,
} from "@/types/pdf/pdfTemplate.js";
import { BaseContract } from "@/types/pdf/pdfVariables.type.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { VARIABLE_CONTRACTS } from "@/utils/pdfContract.utils.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { CustomDocDefinition, renderCustomPdfToBuffer } from "av6-pdf-engine";
import { Request, Response } from "express";

export const buildPdf = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::buildPdf::controller");
  const input = req.body;
  const doc = structuredClone(input);
  const pdf = await renderCustomPdfToBuffer(doc);
  logger.info("exiting::buildPdf::controller");
  res
    .status(200)
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="preview.pdf"`,
    })
    .send(pdf);
});

export const getContractKeys = TryCatch(
  async (_req: Request, res: Response) => {
    logger.info("entering::getContractKeys::controller");

    const keys: BaseContract[] = Object.values(VARIABLE_CONTRACTS).map(
      (contract) => ({
        position: contract.position,
        key: contract.key,
        keyType: contract.keyType,
      })
    );
    logger.info("exiting::getContractKeys::controller");
    return res
      .status(200)
      .json(
        new BaseResponse(
          {
            success: true,
            message: generateSuccessMessage("FETCHED", "Contract keys"),
          },
          keys
        )
      );
  }
);

export const createPdfTemplate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPdfTemplate::controller");
    const input = req.body as CreatePdfTemplateInput;
    const pdfTemplate = await pdfTemplateService.createPdfTemplate(input);

    const doc = structuredClone(
      input.bodyJson
    ) as unknown as CustomDocDefinition;
    pdfTemplateService.createAndUpdatePdfThumbnail(doc, pdfTemplate.id);

    const response = BaseResponse.success(
      { type: "CREATED", data: pdfTemplate },
      "Pdf Template"
    );
    logger.info("exiting::createPdfTemplate::controller");
    return res.status(201).json(response);
  }
);

export const updatePdfTemplate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePdfTemplate::controller");
    const input = req.body as UpdatePdfTemplateInput;
    const pdfTemplate = await pdfTemplateService.updatePdfTemplate(input);

    const doc = structuredClone(
      input.bodyJson
    ) as unknown as CustomDocDefinition;
    pdfTemplateService.createAndUpdatePdfThumbnail(
      doc,
      pdfTemplate.id,
      pdfTemplate.sampleImageUrl
    );

    const response = BaseResponse.success(
      { type: "UPDATED", data: pdfTemplate },
      "Pdf Template"
    );
    logger.info("exiting::updatePdfTemplate::controller");
    return res.status(200).json(response);
  }
);

export const deletePdfTemplate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deletePdfTemplate::controller");
    const { pdfTemplateId } = req.query as { pdfTemplateId: string };
    const pdfTemplate = await pdfTemplateService.deletePdfTemplate(
      Number(pdfTemplateId)
    );
    const response = BaseResponse.success(
      { type: "DELETED", data: pdfTemplate },
      "Pdf Template"
    );
    logger.info("exiting::deletePdfTemplate::controller");
    return res.status(200).json(response);
  }
);

export const makeDefaultPdfTemplate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::makeDefaultPdfTemplate::controller");
    const input = req.body as MakeDefaultPdfTemplateInput;
    await pdfTemplateService.makeDefaultPdfTemplate(input);
    const response = BaseResponse.success({ type: "UPDATED" }, "Pdf Template");
    logger.info("exiting::makeDefaultPdfTemplate::controller");
    return res.status(200).json(response);
  }
);
