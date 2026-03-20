import { PatientTest, Prisma, Tests } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { PathologyMasterDTO } from "../pathology/pathology.js";
import { AppointmentDetailsDto } from "./appointment.js";

/*----------------For Search Test----------------*/
export interface RawSearchTestResult {
  id: number;
  testCode: string | null;
  testName: string | null;
  rate: string;
  department: string | null;
  isCommentRequired: string;
}

export interface SearchTestDTO {
  id: number;
  testCode: string | null;
  testName: string | null;
  rate: number;
  department: string | null;
  isCommentRequired: boolean;
}

export interface SearchTestInput {
  text: string;
}

/*----------------------------------------------*/

/*----------------For Quick Test ---------------*/
export type CreateTestCategoriesInput = Omit<
  Prisma.TestCategoriesUncheckedCreateWithoutTestsInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateTestCategoriesInput extends CreateTestCategoriesInput {
  id: number;
}

export type CreateTests = Omit<
  Prisma.TestsUncheckedCreateInput,
  | "id"
  | "testCategoryId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
export interface CreateTestsInput {
  testCategoryId: number;
  data: CreateTests[];
}
export interface UpdateTests extends CreateTests {
  id?: number;
}
export interface UpdateTestsInput {
  testCategoryId: number;
  data: UpdateTests[];
  existingTests: Tests[];
}

/*----------------------------------------------*/

/*----------------For Investigation/Precedure ---------------*/

export type CreatePatientTest = Omit<
  Prisma.PatientTestUncheckedCreateInput,
  | "id"
  | "appointmentId"
  | "visitId"
  | "patientId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface CreatePatientTestInput {
  appointmentId: number;
  patientId: number;
  data: CreatePatientTest[];
}
export interface UpdatePatientTest extends CreatePatientTest {
  id?: number;
}

export interface UpdatePatientTestInput {
  appointmentId: number;
  patientId: number;
  data: UpdatePatientTest[];
  existing: PatientTest[];
}

export type PatientTestResponse = Prisma.PatientTestGetPayload<{
  include: {
    appointment: true;
    collectionCenter: true;
  };
}>;

export interface PatientTestDTO extends Omit<
  PatientTest,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
  | "processLocation"
  | "testCode"
  | "testName"
> {
  appointment: AppointmentDetailsDto | null;
  processLocation: IdValue | null;
  testDetails: PathologyMasterDTO | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}
/*----------------------------------------------------------*/
