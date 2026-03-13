import { departmentService } from "@/services/staff/department.service.js";
import { staffDesignationService } from "@/services/staff/designation.service.js";
import {
  CreateOrUpdateDoctor,
  DoctorDTO,
  ExcelDoctorRow,
} from "@/types/staff/doctor.js";
import { CreateStaffInput, StaffEntity } from "@/types/staff/doctor.js";
import { isValidDate } from "@repo/shared/utils/date.utils.js";
import dayjs from "dayjs";

export const toDoctorFromExcel = (
  row: ExcelDoctorRow
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
    designationId: row.Designation ?? null,
  };
};

export const toExcelFromDoctor = (
  doctor: CreateOrUpdateDoctor | null
): ExcelDoctorRow => {
  return {
    Name: doctor ? doctor.name : "",
    Title: doctor?.title ?? null,
    "employee ID": doctor ? doctor.employeeId : "",
    Phone: doctor?.phone ?? null,
    Email: doctor ? doctor.email : "",
    Notes: doctor?.notes ?? null,
    Site: doctor?.siteId ?? null,
    Department: doctor?.departmentId ?? null,
    Location: doctor?.locationId ?? null,
    DOB: doctor?.dob ?? "",
    Surname: doctor?.surname ?? "",
    Designation: doctor?.designationId ?? null,
  };
};

export const toStaffEntity = (
  staff: CreateOrUpdateDoctor
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
  employee: StaffEntity
): Promise<DoctorDTO> => {
  const department = employee.employee?.departmentId
    ? await departmentService.getDepartmentById(
        employee.employee.departmentId,
        true
      )
    : null;

  const designation = employee.employee?.designationId
    ? await staffDesignationService.getStaffDesignationById(
        employee.employee?.designationId,
        true
      )
    : null;

  return {
    id: employee.id,
    name: employee.name,
    dob: dayjs(employee.dob).format("YYYY-MM-DD"),
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
