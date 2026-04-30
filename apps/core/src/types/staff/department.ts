import { BinaryFlag, YesNoFlag } from "@repo/db/generated/prisma/client";

export interface DepartmentDTO {
  departmentName: string;
  deptId: string;
  deptDisplayText: string;
  deptSequence: number;
  isSample: BinaryFlag;
  isAnalyte?: BinaryFlag;
  masterDept: number;
  tatData?: string;
  printInTrs?: YesNoFlag;
  isActive: YesNoFlag;
  designation?: string | null;
}

export interface CreateDepartmentInput {
  name: string;
  deptId: string;
  deptDisplayText: string;
  deptSequence: number;
  isSample: BinaryFlag;
  isAnalyte?: BinaryFlag;
  masterDept: number;
  tatData?: string;
  printInTrs?: YesNoFlag;
  isActive: YesNoFlag;
  designation: string | null;
}

export interface ExcelDepartmentRow {
  name: string;
}
