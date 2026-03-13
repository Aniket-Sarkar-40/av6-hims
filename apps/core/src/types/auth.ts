export interface LoginPayload {
  username: string;
  password: string;
}

export interface JwtPayload {
  role: Record<string, string>; // active role
  API_TIME: number;
  expire_at: number;
  username: string;
  email: string;
  contact_no: string;
  [key: string]: unknown;
  id: string;
  uuid: string; // unique identifier for the user session
}

export interface Permission {
  id: number;
  code: string;
  description?: string;
}

// src/modules/auth/perm.mapper.ts
export interface RawRolePermissionResponse {
  id: string;
  role_permission: RawPermGroup[];
}

export interface RawPermGroup {
  id: string;
  name: string;
  short_code: string;
  permission_category: RawPermCat[];
}

export interface RawPermCat {
  id: string;
  short_code: string;
  enable_view: "1" | "0";
  enable_add: "1" | "0";
  enable_edit: "1" | "0";
  enable_delete: "1" | "0";
  // ↓ present only when the upstream system has user‑level overrides
  can_view?: "1" | "0" | null;
  can_add?: "1" | "0" | null;
  can_edit?: "1" | "0" | null;
  can_delete?: "1" | "0" | null;
}

export interface UserDetailsRecord {
  id: string;
  employee_id: string;
  department: string;
  designation: string;
  qualification: string;
  work_exp: string;
  specialization: string;
  name: string;
  surname: string;
  father_name: string;
  mother_name: string;
  contact_no: string;
  emergency_contact_name: string;
  emergency_contact_no: string;
  email: string;
  dob: string;
  marital_status: string | null;
  date_of_joining: string;
  date_of_leaving: string;
  local_address: string;
  permanent_address: string;
  note: string;
  image: string;
  digital_sign: string;
  password: string;
  gender: string;
  blood_group: string;
  account_title: string;
  bank_account_no: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  bank_branch: string | null;
  payscale: string | null;
  basic_salary: string | null;
  epf_no: string | null;
  contract_type: string | null;
  shift: string | null;
  location: string;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  resume: string;
  joining_letter: string;
  resignation_letter: string | null;
  other_document_name: string;
  other_document_file: string;
  user_id: string;
  is_active: string;
  is_eligible_discount: string;
  is_eligible_consumption: string;
  verification_code: string;
  no_of_children: number | null;
  age: number | null;
  staff_place_of_birth: string | null;
  staff_nationality: string | null;
  staff_hometown: string | null;
  staff_religion: string | null;
  denomination: string | null;
  profilePhoto: string | null;
  hourse_of_works: string | null;
  holiday_entitlement: string;
  national_health_insurance_no: string;
  ssnit_no: string;
  other_scheme: string;
  spouse_name: string | null;
  spouse_sex: string | null;
  spouse_nationality: string | null;
  spouse_dob: string | null;
  spouse_phone: string | null;
  spouse_address: string | null;
  is_disc_allowed: string;
  doctor_registration_no: string;
  loan_amount: string | null;
  tenure: string | null;
  interest_percentage: string | null;
  total_interest_amount: string | null;
  monthly_installment: string | null;
  effective_from: string | null;
  attendance_payroll_eligibility: string;
  incentive_eligibility: string;
  is_clinical_consultant: string;
  is_opd_consultant: string;
  reporting_head: string | null;
  remember_token: string | null;
  opd_department_id: number | null;
  prefix_id: number | null;
  license_name: string | null;
  incentive_calculation_type: string;
  user_type: string;
  role_id: string;
}

export interface ExternalUserRes {
  status: boolean;
  data: UserDetailsRecord;
}

export interface UserResponse {
  user: UserDetailsRecord;
  permissions: string[];
  roles: Record<string, string>[];
  currentRole: { id: string; name: string };
}

export interface RoleMap {
  [roleName: string]: string;
}

export interface ApiRoleResponse {
  id: string;
  role: RoleMap[];
}

export interface UploadFilesResponse {
  success: boolean;
  uploadedPaths: FileInfo[];
}

export interface FileInfo {
  fileName: string;
  path: string;
  base64: string;
}

export interface ApiLoginResponse {
  token?: string;
  shortToken?: string;
  uuid?: string;
}
export interface LoginResponse {
  token: string;
  shortToken: string;
  uuid: string;
}

export interface ChangeRoleExtWire extends ApiLoginResponse {
  status: boolean;
}
