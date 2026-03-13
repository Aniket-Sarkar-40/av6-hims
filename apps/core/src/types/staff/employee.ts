import {
  BinaryFlag,
  Department,
  Prisma,
  StaffDesignation,
} from "@repo/db/generated/prisma/client";

export interface EmployeeDTO {
  id: number;
  name: string;
  surname: string;
  dob: string;
  employeeId: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  department: Department | null;
  designation: StaffDesignation | null;
  createdAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
  updatedAt: Date | null;
}

export interface CreateOrUpdateEmployee {
  name: string;
  surname: string;
  employeeId: string;
  dob: string;
  title?: string | null;
  phone?: string | null;
  email: string;
  notes?: string | null;
  siteId?: number | null;
  designationId?: number | null;
  departmentId?: number | null;
  locationId?: number | null;
}

export interface ExcelEmployeeRow {
  Name: string;
  Surname: string;
  "Employee ID": string;
  DOB: string;
  Title?: string | null;
  Phone?: string | null;
  Email: string;
  Notes?: string | null;
  Site?: number | null;
  Department?: number | null;
  Location?: number | null;
  Designation?: number | null;
}

export type StaffResponse = Prisma.StaffGetPayload<{
  select: {
    id: true;
    name: true;
    surname: true;
    designation: true;
    employeeId: true;
    department: true;
    email: true;
  };
}>;

export interface StaffDTO {
  // — from `Staff` table —
  id: number;
  employeeId: string;
  department: Department | null;
  designation: string;
  qualification: string;
  workExp: string;
  specialization: string;
  name: string;
  surname: string;
  fatherName: string;
  motherName: string;
  contactNo: string;
  emergencyContactName: string;
  emergencyContactNo: string;
  email: string;
  dob: Date;
  maritalStatus: string | null;
  dateOfJoining: Date;
  dateOfLeaving: Date;
  localAddress: string;
  permanentAddress: string;
  note: string;
  image: string;
  digitalSign: string;
  password: string;
  gender: string;
  bloodGroup: string;
  accountTitle: string;
  bankAccountNo: string | null;
  bankName: string | null;
  ifscCode: string | null;
  bankBranch: string | null;
  payscale: string | null;
  basicSalary: string | null;
  epfNo: string | null;
  contractType: string | null;
  shift: string | null;
  locationName: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  resume: string | null;
  joiningLetter: string | null;
  resignationLetter: string | null;
  otherDocumentName: string | null;
  otherDocumentFile: string | null;
  userId: number;
  isActive: number;
  isEligibleDiscount: BinaryFlag;
  isEligibleConsumption: BinaryFlag;
  verificationCode: string;
  noOfChildren: number | null;
  age: number | null;
  staffPlaceOfBirth: string | null;
  staffNationality: string | null;
  staffHometown: string | null;
  staffReligion: string | null;
  denomination: string | null;
  profilePhoto: string | null;
  hoursOfWorks: string | null;
  holidayEntitlement: string;
  nationalHealthInsuranceNo: string;
  ssnitNo: string;
  otherScheme: string;
  spouseName: string | null;
  spouseSex: string | null;
  spouseNationality?: string | null;
  spouseDob: Date | null;
  spousePhone: string | null;
  spouseAddress: string | null;
  isDiscAllowed: BinaryFlag;
  doctorRegistrationNo: string | null;
  loanAmount: number;
  tenure: number;
  interestPercentage: number;
  totalInterestAmount: number;
  monthlyInstallment: number;
  effectiveFrom: string | null;
  attendancePayrollEligibility: BinaryFlag;
  incentiveEligibility: BinaryFlag;
  isClinicalConsultant: BinaryFlag;
  isOpdConsultant: boolean;
  reportingHead: number | null;
  rememberToken: string | null;
  opdDepartmentId: number | null;
  prefixId: number | null;
  licenseName: string | null;
  incentiveCalculationType: string;

  title: string | null;

  createdAt: Date;
  createdBy: number | null;
  updatedAt: Date | null;
  updatedBy: number | null;
}

export type StaffEntity = Prisma.StaffGetPayload<{
  include: {
    employee: true;
  };
}>;

export interface EmployeeCache {
  id: number;
  name: string;
  surname: string;
  dob: string;
  employeeId: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  departmentId: number | null;
  designationId: number | null;
}
