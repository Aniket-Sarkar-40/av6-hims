import { PmsGender } from "@repo/db/generated/prisma/enums.js";

export interface CreateCustomerInput {
  name: string;
  email: string;
  countryCode: string | null;
  mobileNo: string;
  dob: Date;
  gender: PmsGender;
  address1: string;
  address2: string | null;
  city: string | null;
  pinCode: number | null;
  lattitudeLongitude: string | null;
  ghanaCardNo: string;
  tinNo: string | null;
  discount: number | null;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
}
