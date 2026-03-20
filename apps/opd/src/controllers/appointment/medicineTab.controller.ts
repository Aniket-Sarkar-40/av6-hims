import { medicineTabService } from "@/services/appointment/medicineTab.service.js";
import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createMedicineTab = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createMedicineTab::controller");
    const input = req.body;
    const created = await medicineTabService.createMedicineTab(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Medicine Tab",
    );
    logger.info("exiting::createMedicineTab::controller");
    return res.status(200).json(response);
  },
);

export const updateMedicineTab = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedicineTab::controller");
    const input = req.body;
    const updated = await medicineTabService.updateMedicineTab(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Medicine Tab",
    );
    logger.info("exiting::updateMedicineTab::controller");
    return res.status(200).json(response);
  },
);

export const deleteMedicineTab = TryCatch(async (req, res) => {
  logger.info("entering::deletePatientMedicine::controller");
  const { id } = req.query as { id: string };

  await medicineTabService.deleteMedicineTab(Number(id));

  logger.info("exiting::deletePatientMedicine::controller");
  return res
    .status(200)
    .json(BaseResponse.success({ type: "DELETED" }, "Medicine Tab"));
});
