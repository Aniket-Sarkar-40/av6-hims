import { toStoreRequisitionBatchWiseDTO, toStoreRequisitionDTO } from "@/mapper/purchase/storeRequisition.mapper";
import {
  acknowledgeStoreRequisition,
  approveStoreRequisition,
  createStoreRequisitionInDb,
  deleteStoreRequisitionFromDb,
  getAllStoreRequisitionFromDb,
  getStoreRequisitionBatchWiseFromDb,
  getStoreRequisitionByIdFromDb,
  rejectStoreRequisition,
  updateStoreRequisitionInDb,
} from "@/repository/purchase/storeRequisition.repository";
import {
  AcknowledgeRequisition,
  ApproveStoreReqInput,
  CreateStoreRequisitionInput,
  RejectStoreRequisitionInput,
} from "@/types/purchase/storeRequisition";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  acknowledgeStoreRequisitionServiceValidation,
  approveStoreRequisitionServiceValidation,
  createStoreRequisitionServiceValidation,
  deleteStoreRequisitionServiceValidation,
  rejectStoreRequisitionServiceValidation,
  updateStoreRequisitionServiceValidation,
  // updateStoreRequisitionServiceValidation,
} from "@/validations/service/purchase/storeRequisition.service.validation";

export const storeRequisitionService = {
  async createStoreRequisition(input: CreateStoreRequisitionInput) {
    logger.info("entering::createStore Requisition::service");
    await createStoreRequisitionServiceValidation(input);
    const createStoreRequisition = await createStoreRequisitionInDb(input);

    logger.info("exiting::createStore Requisition::service");
    return createStoreRequisition;
  },

  async updateStoreRequisition(input: CreateStoreRequisitionInput) {
    logger.info("entering::updateStoreRequisition::service");

    await updateStoreRequisitionServiceValidation(input);

    const updatedStoreReq = await updateStoreRequisitionInDb(input);

    logger.info("exiting::updateStoreRequisition::service");
    return updatedStoreReq;
  },

  async getAllStoreRequisition() {
    logger.info("entering::getAllStoreRequisition::service");

    const records = await getAllStoreRequisitionFromDb();
    if (records.length === 0) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "storeRequisition Order"));
    }

    const dto = await Promise.all(
      records.map(async (sr) => {
        return toStoreRequisitionDTO({
          ...sr,
          storeRequisitionDetails: sr.storeRequisitionDetails,
        });
      })
    );

    logger.info("exiting::getAllStoreRequisition::service");
    return dto;
  },

  async getStoreRequisitionById(id: number) {
    logger.info("entering::getStoreRequisitionById::service id=" + id);

    validIdCheck(id);
    const storeReq = await getStoreRequisitionByIdFromDb(id);
    if (!storeReq) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store Requisition"));
    }

    const dto = await toStoreRequisitionDTO(storeReq);

    logger.info("exiting::getStoreRequisitionById::service id=" + id);
    return dto;
  },

  async deleteStoreRequisition(id: number): Promise<void> {
    logger.info("entering::deleteStoreRequisition::service id=" + id);

    await deleteStoreRequisitionServiceValidation(id);

    await deleteStoreRequisitionFromDb(id);
    logger.info("exiting::deleteStoreRequisition::service id=" + id);
  },

  async rejectStoreRequisition(input: RejectStoreRequisitionInput): Promise<void> {
    logger.info("entering::rejectStoreRequisition::service id=" + input.id);

    await rejectStoreRequisitionServiceValidation(input);

    await rejectStoreRequisition(input);
    logger.info("exiting::rejectStoreRequisition::service id=" + input.id);
  },

  async approveStoreRequisition(input: ApproveStoreReqInput): Promise<void> {
    logger.info("entering::approveStoreRequisition::service");

    await approveStoreRequisitionServiceValidation(input);

    await approveStoreRequisition(input);
    logger.info("exiting::approveStoreRequisition::service");
  },

  async acknowledgeStoreRequisition(input: AcknowledgeRequisition): Promise<void> {
    logger.info("entering::acknowledgeStoreRequisition::service");

    await acknowledgeStoreRequisitionServiceValidation(input);

    await acknowledgeStoreRequisition(input);
    logger.info("exiting::acknowledgeStoreRequisition::service");
  },

  async getStoreRequisitionBatchWiseById(id: number) {
    logger.info("entering::getStoreRequisitionBatchWiseById::service id=" + id);

    validIdCheck(id);
    const storeReq = await getStoreRequisitionBatchWiseFromDb(id);
    if (!storeReq) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store Requisition"));
    }

    const dto = await toStoreRequisitionBatchWiseDTO(storeReq);

    logger.info("exiting::getStoreRequisitionBatchWiseById::service id=" + id);
    return dto;
  },

  // async buildExcelJSWorkbookForStoreReqByFilter(input: StoreReqExcelFilter): Promise<ExcelJs.Workbook> {
  //   const storeReqData = await getStoreReqForExcelInDb(input);
  //   if (storeReqData.length === 0) {
  //     throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store Requisition"));
  //   }

  //   const storeReqDto = await Promise.all(
  //     storeReqData.map(async (sr) => {
  //       return toStoreRequisitionDTO(sr);
  //     })
  //   );

  //   const wb = new ExcelJs.Workbook();
  //   const ws = wb.addWorksheet("Store Indent Report");

  //   ws.properties.defaultRowHeight = 18;
  //   let rowIndex = 1;

  //   for (const stReq of storeReqDto) {
  //     /* --- Fund Header Section --- */
  //     ws.mergeCells(rowIndex, 1, rowIndex, 12);
  //     ws.getCell(rowIndex, 1).value = `Store requisition no: ${stReq.srNumber}`;
  //     ws.getCell(rowIndex, 1).font = { bold: true };
  //     rowIndex++;

  //     /* Fund Details (Amount, Start Date, etc.) */
  //     const startInd = rowIndex;

  //     ws.addRow([
  //       "Requisition from",
  //       `${stReq.staff.name} ${stReq.staff.surname}`,
  //       "Branch",
  //       stReq.branch?.name,
  //       "Warehouse",
  //       stReq.warehouse?.name,
  //     ]);
  //     rowIndex++;
  //     ws.addRow([
  //       "Requisition Status",
  //       stReq.storeReqStatus,
  //       "Requisition Acknowledge Status",
  //       stReq.storeReqAckStatus,
  //       "Date",
  //       dayjs(stReq.date).format("YYYY-MM-DD"),
  //     ]);
  //     rowIndex++;

  //     for (let row = startInd; row < rowIndex; row++) {
  //       [1, 3, 5].map((col) => {
  //         ws.getCell(row, col).font = { bold: true, color: { argb: "666161" } };
  //       });
  //     }

  //     if (stReq.storeRequisitionDetails.length === 0) {
  //       ws.addRow(["No item associated with this requisition."]);
  //       rowIndex++;
  //       continue;
  //     }
  //     /* --- Fund Table Header --- */
  //     const stReqTitles = [
  //       "Medicine Name",
  //       "Medicine No",
  //       "Category Name",
  //       "Medicine Type",
  //       "Medicine Composition",
  //       "Medicine Unit",
  //       "Medicine Manufacturer",
  //       "Medicine Pack Size",
  //       "Medicine Drug Type",
  //       "Requested Quantity",
  //       "Assigned Quantity",
  //       "Acknowledged Quantity",
  //     ];
  //     ws.addRow(stReqTitles).font = { bold: true };
  //     rowIndex++;

  //     /* --- StoreReq Rows --- */
  //     stReq.storeRequisitionDetails.forEach((r) => {
  //       const item = r.item;
  //       ws.addRow([
  //         item?.medicineName,
  //         item?.itemNumber,
  //         r.itemCategory?.name,
  //         r.medType,
  //         r.medComp,
  //         r.medUnit,
  //         r.manufacturer,
  //         r.packSize,
  //         r.drugType,
  //         r.reqQuantity,
  //         r.assignedQuantity,
  //         r.acknowledgedQuantity,
  //       ]);
  //       rowIndex++;
  //     });

  //     /* Add a blank line between fund sections */
  //     rowIndex++;
  //     rowIndex++;
  //   }

  //   /* Auto size the columns */
  //   ws.columns.forEach((col) => {
  //     let max = 10;
  //     col.eachCell?.({ includeEmpty: true }, (cell) => {
  //       const len = cell.value ? String(cell.value).length : 0;
  //       if (len > max) max = len;
  //     });
  //     col.width = max + 2;
  //   });

  //   return wb;
  // },
};
