import { departmentService } from "@/services/staff/department.service.js";
import { staffDesignationService } from "@/services/staff/designation.service.js";
import {
  CreateOrUpdateDoctor,
  DoctorDTO,
  ExcelDoctorRow,
} from "@/types/staff/doctor.js";
import { CreateStaffInput, StaffEntity } from "@/types/staff/doctor.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { isValidDate } from "@repo/shared/utils/date.utils.js";

import dayjs from "dayjs";

export const toDoctorFromExcel = (
  row: ExcelDoctorRow,
): CreateOrUpdateDoctor => {
  return {
    name: row.Name,
    title: row.Title ?? null,
    employeeId: row["employee ID"] ?? "",
    phone:
      row.Phone !== undefined && row.Phone !== null ? String(row.Phone) : null,
    email: row.Email ?? "",
    notes: row.Notes ?? null,
    siteId:
      row.Site !== undefined && row.Site !== null ? Number(row.Site) : null,
    departmentId:
      row.Department !== undefined && row.Department !== null
        ? Number(row.Department)
        : null,
    locationId:
      row.Location !== undefined && row.Location !== null
        ? Number(row.Location)
        : null,
    dob: row.DOB,
    surname: row.Surname,
    designationId: row.Designation,
  };
};

export const toExcelFromDoctor = (
  doctor: CreateOrUpdateDoctor | null,
): ExcelDoctorRow => {
  return {
    Name: doctor ? doctor.name : "",
    Title: doctor ? doctor.title : " ",
    "employee ID": doctor ? doctor.employeeId : "",
    Phone: doctor
      ? typeof doctor.phone === "string"
        ? parseInt(doctor.phone, 10)
        : doctor.phone
      : null,
    Email: doctor ? doctor.email : "",
    Notes: doctor ? doctor.notes : "",
    Site: doctor && doctor.siteId !== null ? doctor.siteId : null,
    Department:
      doctor && doctor.departmentId !== null ? doctor.departmentId : null,
    Location: doctor && doctor.locationId !== null ? doctor.locationId : null,
    DOB: doctor ? doctor.dob : "",
    Surname: doctor ? doctor.surname : "",
    Designation: doctor ? doctor.designationId : null,
  };
};

export const toStaffEntity = (
  staff: CreateOrUpdateDoctor,
): CreateStaffInput => ({
  employeeId: staff.employeeId,
  qualification: "",
  workExp: "",
  specialization: "",
  name: staff.name,
  surname: staff.surname,
  fatherName: "",
  motherName: "",
  contactNo: staff.phone || "",
  emergencyContactName: "",
  emergencyContactNo: "",
  email: staff.email,
  dob: isValidDate(staff.dob) ? new Date(staff.dob) : new Date(),
  maritalStatus: "",
  dateOfJoining: new Date(),
  localAddress: "",
  permanentAddress: "",
  note: staff.notes || "",
  password: "",
  gender: "",
  bloodGroup: "",
  accountTitle: staff.title || "",
  image: "",
  digitalSign: "",
  department: JSON.stringify(staff.departmentId),
  designation: staff.designationId ? JSON.stringify(staff.designationId) : "",
  userId: 0,
  isActive: 1,
  tenure: 0,
  isEligibleConsumption: "false",
  isEligibleDiscount: "false",
  verificationCode: "",
  nationalHealthInsuranceNo: "",
  ssnitNo: "",
  otherScheme: "",
  holidayEntitlement: "",
});

export const toDoctorDTO = async (
  employee: StaffEntity,
): Promise<DoctorDTO> => {
  let department = null;

  logger.info(
    "Fetching department: ---" +
      employee.employee?.departmentId +
      "--- And type -----" +
      typeof employee.employee?.departmentId +
      "---",
  );
  try {
    department =
      employee?.department && validIdCheck(Number(employee?.department))
        ? await departmentService.getDepartmentById(
            Number(employee?.department),
            true,
          )
        : null;
  } catch (error) {
    logger.error("Error fetching department:", error);
  }

  const designation = employee.employee?.designationId
    ? await staffDesignationService.getStaffDesignationById(
        employee.employee?.designationId,
        true,
      )
    : null;

  return {
    id: employee.id,
    name: employee.name,
    dob: employee.dob ? dayjs(employee.dob).format("YYYY-MM-DD") : "",
    surname: employee.surname || "",
    employeeId: employee.employeeId,
    designation,
    title: employee.accountTitle,
    notes: employee.note ?? null,
    phone: employee.contactNo,
    email: employee.email ?? null,
    department: department ?? null,
    createdBy: employee.employee?.createdBy || null,
    createdAt: employee.employee?.createdAt || null,
    updatedBy: employee.employee?.updatedBy || null,
    updatedAt: employee.employee?.updatedAt || null,
  };
};
