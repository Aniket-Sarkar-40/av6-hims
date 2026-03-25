import {
  toOpdAppointDto,
  toOpdBillDto,
} from "@/mapper/opdList/opdList.mapper.js";
import { getCorporateClientByCcId } from "@/repository/opd/corporate.repository.js";
import {
  fetchPendingPaginatedAppointments,
  fetchPendingPaginatedAppointmentsExcel,
  getAllLastAppointments,
  getMedicineInstructionFromDb,
  getOpdBill,
} from "@/repository/opd/opdList.repository.js";
import {
  AppointmentDosageDto,
  AppointmentMedicineSummary,
  LastAppointmentRes,
  MedicineInstruction,
  OpdBillReq,
  SearchRequestOpd,
  SearchWithDate,
} from "@/types/opd/opdList.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { toIdValue } from "av6-utils";
import ExcelJs from "exceljs";
import { itemService } from "../item/item.service.js";
import { IdValue } from "@repo/shared/types/global.js";

export const opdListService = {
  async opdList(params: SearchRequestOpd) {
    logger.info("entering::opdListService::opdList");

    const { pageNo, pageSize, sortDir = "DESC", startDate, endDate } = params;
    const page = typeof pageNo === "string" ? parseInt(pageNo, 10) : pageNo;
    const perPage =
      typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
    const order = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await fetchPendingPaginatedAppointments({
      pageNo: page,
      pageSize: perPage,
      sortDir: order,
      searchText: params.searchText,
      startDate: startDate,
      endDate: endDate,
      ccId: params.ccId,
    });

    logger.info("exiting::opdListService::opdList");
    return result;
  },

  async getOpdByAppointment(input: OpdBillReq) {
    logger.info("entering::opdListService::opdList");

    if (input.aptId) validIdCheck(input.aptId);
    if (input.branchId) validIdCheck(input.branchId);

    const result = await getOpdBill(input.aptId);

    if (!result) {
      logger.warn(`No OPD bill found for appointment ID: ${input.aptId}`);
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Opd Bill"),
      );
    }

    const resDto = await toOpdBillDto(result, input);

    logger.info("exiting::opdListService::opdList");
    return resDto;
  },

  async getOpdByAppointmentWithoutDto(
    id: number,
  ): Promise<AppointmentDosageDto> {
    logger.info("entering::opdListService::opdList");

    const result = await getOpdBill(id);
    if (!result) {
      logger.warn(`No OPD bill found for appointment ID: ${id}`);
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Opd Bill"),
      );
    }

    const medIds = result.medicines.map((m) => m.medId);
    const items = await itemService.getItemsByIdsForAppointment(medIds);

    const resDto = toOpdAppointDto(result, items);

    logger.info("exiting::opdListService::opdList");
    return resDto;
  },

  async buildAppointmentsWorkbook(
    params: SearchWithDate,
  ): Promise<ExcelJs.Workbook> {
    const paginatedResult =
      await fetchPendingPaginatedAppointmentsExcel(params);

    const data: AppointmentMedicineSummary[] = paginatedResult;

    if (!data.length) {
      throw new ErrorHandler(404, "No appointments found");
    }

    const wb = new ExcelJs.Workbook();
    const ws = wb.addWorksheet("Pending Appointments", {
      properties: { defaultRowHeight: 18 },
      pageSetup: { fitToPage: true, fitToWidth: 1, orientation: "landscape" },
    });

    const title = ws.addRow(["OPD MEDICINE LIST"]);
    title.font = { bold: true, size: 14 };
    const totalColumns = 13;
    ws.mergeCells(title.number, 1, title.number, totalColumns);
    title.alignment = { horizontal: "center", vertical: "middle" };

    const tableHeaders = [
      "Id",
      "Patient Name",
      "Age",
      "DOB",
      "Gender",
      "Appointment No",
      "Booked By",
      "Appointment Type",
      "Appointment Date",
      "Visit No",
      "Status",
      "Bill No",
      "Insurance Name",
    ];

    const tableRows = data.map((d, i) => [
      i + 1,
      d.patientName,
      d.age,
      d.dob,
      d.gender,
      d.appointmentNo,
      d.bookedBy,
      d.appointmentType,
      d.appointmentDate,
      d.visitNo || "",
      d.appointmentStatus || "",
      d.billNo || "",
      d.insurerName || "",
    ]);

    ws.addTable({
      name: "PendingAppointments",
      ref: `A${title.number + 2}`,
      headerRow: true,
      style: { theme: "TableStyleMedium2", showRowStripes: true },
      columns: tableHeaders.map((h) => ({ name: h, filterButton: true })),
      rows: tableRows,
    });

    ws.getColumn(6).numFmt = "mm/dd/yyyy";
    ws.getColumn(7).width = 15;
    ws.getColumn(10).width = 20;

    ws.columns.forEach((col) => {
      col.alignment = { horizontal: "left" }; // Left-align all columns
      let max = 10;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > max) max = len;
        });
      }
      col.width = max + 2;
    });

    return wb;
  },

  async getMedicineInstruction(id: number): Promise<MedicineInstruction[]> {
    logger.info("entering::getMedicineInstruction::opdList");

    const result = await getMedicineInstructionFromDb(id);
    if (result.length === 0) {
      logger.warn(`No medicine instruction found for appointment ID: ${id}`);
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Medicine Instruction"),
      );
    }
    logger.info("exiting::getMedicineInstruction::opdList");
    return result;
  },

  async getCorporateClientByCcId(ccId: number): Promise<IdValue[]> {
    logger.info("entering::getCorporateClientByCcId::opdList");

    const result = await getCorporateClientByCcId(ccId);

    const response = result.map((item) => toIdValue(item, "customerName"));
    logger.info("exiting::getCorporateClientByCcId::opdList");
    return response;
  },

  async getLastAppointments(patientId: number): Promise<LastAppointmentRes[]> {
    logger.info("entering::getCorporateClientByCcId::opdList");

    const result = await getAllLastAppointments(patientId);

    logger.info("exiting::getCorporateClientByCcId::opdList");
    return result;
  },
};
