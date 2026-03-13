import { departmentService } from "@/services/staff/department.service.js";
import { staffDesignationService } from "@/services/staff/designation.service.js";
import {
  CreateOrUpdateEmployee,
  EmployeeCache,
  EmployeeDTO,
  ExcelEmployeeRow,
  StaffEntity,
} from "@/types/staff/employee.js";
import { isValidDate } from "@repo/shared/utils/date.utils.js";
import { Staff } from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";
import { CreateStaffInput } from "@/types/staff/doctor.js";

export const toEmployeeFromExcel = (
  row: ExcelEmployeeRow
): CreateOrUpdateEmployee => {
  return {
    name: row.Name,
    title: row.Title ?? null,
    employeeId: row["Employee ID"] ?? "",
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

export const toExcelFromEmployee = (
  employee: CreateOrUpdateEmployee | null
): ExcelEmployeeRow => {
  return {
    Name: employee ? employee.name : "",
    Title: employee?.title ?? null,
    "Employee ID": employee ? employee.employeeId : "",
    Phone: employee?.phone ?? null,
    Email: employee?.email ?? "",
    Notes: employee?.notes ?? null,
    Site: employee?.siteId ?? null,
    Department: employee?.departmentId ?? null,
    Location: employee?.locationId ?? null,
    DOB: employee?.dob ?? "",
    Surname: employee?.surname ?? "",
    Designation: employee?.designationId ?? null,
  };
};

export const toStaffEntity = (
  staff: CreateOrUpdateEmployee
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

export const toEmployeeDTO = async (
  employee: StaffEntity
): Promise<EmployeeDTO> => {
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

export const toEmployeeCache = (employee: Staff): EmployeeCache => {
  return {
    id: employee.id,
    name: employee.name,
    dob: dayjs(employee.dob).format("YYYY-MM-DD"),
    surname: employee.surname || "",
    employeeId: employee.employeeId,
    title: employee.accountTitle,
    phone: employee.contactNo,
    email: employee.email ?? null,
    departmentId: Number(employee.department ?? null),
    designationId: Number(employee.designation ?? null),
  };
};
