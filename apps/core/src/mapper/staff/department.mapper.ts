import {
  CreateDepartmentInput,
  ExcelDepartmentRow,
} from "@/types/staff/department.js";
import { BinaryFlag, YesNoFlag } from "@repo/db/generated/prisma/client";

export const toDepartmentFromExcel = (
  row: ExcelDepartmentRow,
): CreateDepartmentInput => {
  return {
    name: row.name,
    isActive: YesNoFlag.yes, // Default value if not provided in the excel file
    deptId: "0",
    deptDisplayText: row.name,
    deptSequence: 0,
    isSample: "false",
    isAnalyte: "false",
    masterDept: 0,
    tatData: "",
    printInTrs: YesNoFlag.yes,
    designation: "",
  };
};

export const toExcelFromDepartment = (
  department: CreateDepartmentInput | null,
): ExcelDepartmentRow => {
  return {
    name: department ? department.name : "",
  };
};

export const toDepartmentCreateData = (department: CreateDepartmentInput) => {
  const {
    name,
    deptId = "0",
    deptDisplayText = name,
    deptSequence = 0,
    isSample = BinaryFlag.false,
    isAnalyte = null,
    masterDept = 0,
    tatData = null,
    printInTrs = YesNoFlag.yes,
    isActive = YesNoFlag.yes,
  } = department;

  return {
    name,
    deptId,
    deptDisplayText,
    deptSequence,
    isSample,
    isAnalyte,
    masterDept,
    tatData,
    printInTrs,
    isActive,
  };
};
