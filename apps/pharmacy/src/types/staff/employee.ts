import {
  BinaryFlag,
  Department,
  IncentiveCalculationType,
  Prisma,
  StaffDesignation,
} from "@repo/db/generated/prisma/client";

export interface EmployeeDTO {
  id: number;
  name: string;
  surname: string | null;
  dob: string | null;
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
  Phone?: number | null;
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
  // spouseDob: Date | null;
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

// staff.dto.ts

export interface CreateStaffInput {
  // ─── Required string fields ────────────────────────────────────────────────
  // id?: number;
  employeeId: string; // @unique @db.VarChar(200)
  department: string; // @db.VarChar(100)
  designation: string; // @db.VarChar(100)
  qualification: string; // @db.VarChar(500)
  workExp: string; // @map("work_exp") @db.VarChar(200)
  specialization: string; // @db.VarChar(200)
  name: string; // @db.VarChar(200)
  surname: string; // @db.VarChar(200)
  fatherName: string; // @map("father_name") @db.VarChar(200)
  motherName: string; // @map("mother_name") @db.VarChar(200)
  contactNo: string; // @map("contact_no") @db.VarChar(200)
  emergencyContactName: string; // @map("emergency_contact_name") @db.VarChar(200)
  emergencyContactNo: string; // @map("emergency_contact_no") @db.VarChar(200)
  email: string; // @db.VarChar(200)
  dob: Date; // @db.Date
  dateOfJoining: Date; // @map("date_of_joining") @db.Date
  localAddress: string; // @map("local_address") @db.VarChar(300)
  permanentAddress: string; // @map("permanent_address") @db.VarChar(200)
  note: string; // @db.VarChar(200)
  image: string; // @db.VarChar(200)
  password: string; // @db.VarChar(250)
  gender: string; // @db.VarChar(50)
  bloodGroup: string; // @map("blood_group") @db.VarChar(100)
  accountTitle: string; // @map("account_title") @db.VarChar(200)
  userId: number; // @map("user_id")
  isActive: number; // @map("is_active")
  digitalSign: string; // @map("digital_sign") @db.VarChar(255)
  isEligibleDiscount: BinaryFlag; // @map("is_eligible_discount")
  isEligibleConsumption: BinaryFlag; // @map("is_eligible_consumption")
  verificationCode: string; // @map("verification_code") @db.VarChar(100)
  holidayEntitlement: string; // @map("holiday_entitlement") @db.VarChar(255)
  nationalHealthInsuranceNo: string; // @map("national_health_insurance_no") @db.VarChar(255)
  ssnitNo: string; // @map("ssnit_no") @db.VarChar(255)
  otherScheme: string; // @map("other_scheme") @db.VarChar(255)

  // ─── Nullable/Optional fields (use `?`) ──────────────────────────────────
  incentiveCalculationType?: IncentiveCalculationType; // @map("incentive_calculation_type")
  maritalStatus?: string; // @map("marital_status") @db.VarChar(100)
  // dateOfLeaving: string; // @map("date_of_leaving") @db.Date
  bankAccountNo?: string; // @map("bank_account_no") @db.VarChar(200)
  bankName?: string; // @map("bank_name") @db.VarChar(200)
  ifscCode?: string; // @map("ifsc_code") @db.VarChar(200)
  bankBranch?: string; // @map("bank_branch") @db.VarChar(100)
  payscale?: string; // @db.VarChar(200)
  basicSalary?: string; // @map("basic_salary") @db.VarChar(200)
  epfNo?: string; // @map("epf_no") @db.VarChar(200)
  contractType?: string; // @map("contract_type") @db.VarChar(100)
  shift?: string; // @db.VarChar(100)
  location?: string; // @db.VarChar(100)
  facebook?: string; // @db.VarChar(200)
  twitter?: string; // @db.VarChar(200)
  linkedin?: string; // @db.VarChar(200)
  instagram?: string; // @db.VarChar(200)
  resume?: string; // @db.VarChar(200)
  joiningLetter?: string; // @map("joining_letter") @db.VarChar(200)
  resignationLetter?: string; // @map("resignation_letter") @db.VarChar(200)
  otherDocumentName?: string; // @map("other_document_name") @db.VarChar(200)
  otherDocumentFile?: string; // @map("other_document_file") @db.VarChar(200)
  noOfChildren?: number; // @map("no_of_children")
  age?: number;
  staffPlaceOfBirth?: string; // @map("staff_place_of_birth") @db.VarChar(100)
  staffNationality?: string; // @map("staff_nationality") @db.VarChar(100)
  staffHometown?: string; // @map("staff_hometown") @db.VarChar(255)
  staffReligion?: string; // @map("staff_religion") @db.VarChar(100)
  denomination?: string; // @db.VarChar(100)
  profilePhoto?: string; // @map("profilePhoto") @db.VarChar(255)
  hoursOfWorks?: string; // @map("hourse_of_works") @db.VarChar(100)
  spouseName?: string; // @map("spouse_name") @db.VarChar(255)
  spouseSex?: string; // @map("spouse_sex") @db.VarChar(100)
  spouseNationality?: string; // @map("spouse_nationality") @db.VarChar(100)
  // spouseDob?: Date; // @map("spouse_dob") @db.Date
  spousePhone?: string; // @map("spouse_phone") @db.VarChar(20)
  spouseAddress?: string; // @map("spouse_address") @db.Text
  isDiscAllowed?: BinaryFlag; // @map("is_disc_allowed")
  doctorRegistrationNo?: string; // @map("doctor_registration_no") @db.VarChar(100)
  loanAmount?: number; // @map("loan_amount") @db.Decimal(25, 2)
  tenure?: number; // @default(0)
  interestPercentage?: number; // @map("interest_percentage") @db.Decimal(25, 2)
  totalInterestAmount?: number; // @map("total_interest_amount") @db.Decimal(25, 2)
  monthlyInstallment?: number; // @map("monthly_installment") @db.Decimal(25, 2)
  effectiveFrom?: string; // @map("effective_from") @db.VarChar(50)
  attendancePayrollEligibility?: BinaryFlag; // @map("attendance_payroll_eligibility")
  incentiveEligibility?: BinaryFlag; // @map("incentive_eligibility")
  isClinicalConsultant?: BinaryFlag; // @map("is_clinical_consultant")
  isOpdConsultant?: boolean; // @map("is_opd_consultant")
  reportingHead?: number; // @map("reporting_head")
  rememberToken?: string; // @map("remember_token") @db.VarChar(255)
  opdDepartmentId?: number; // @map("opd_department_id")
  prefixId?: number; // @map("prefix_id")
  licenseName?: string; // @map("license_name") @db.VarChar(100)
}

export type StaffEntity = Prisma.StaffGetPayload<{
  include: {
    employee: true;
  };
}>;

export interface EmployeeCache {
  id: number;
  name: string;
  surname: string | null;
  dob: string | null;
  employeeId: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  departmentId: number | null;
  designationId: number | null;
}
