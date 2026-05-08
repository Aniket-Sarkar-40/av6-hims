import { SearchTestInput } from "@/types/appointment/investigation.js";
import {
  arrayRequired,
  idOptional,
  idRequired,
  intOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const SearchTestSchema = Joi.object<SearchTestInput>({
  text: strRequired("Search Text", 3),
});

export const CreateTestCategoriesSchema = Joi.object({
  doctorId: idRequired("Doctor Id"),

  catergoryName: strRequired("Category Name"),
});

export const UpdateTestCategoriesSchema = CreateTestCategoriesSchema.keys({
  id: idRequired("Test Category Id"),
});

const TestItemSchema = Joi.object({
  testId: idRequired("Test Id"),

  testCode: strRequired("Test Code"),

  testName: strRequired("Test Name"),
});

export const CreateTestsSchema = Joi.object({
  testCategoryId: idRequired("Test Category Id"),

  data: arrayRequired("Tests Data", TestItemSchema, 1),
});

const UpdateTestItemSchema = TestItemSchema.keys({
  id: idOptional("Test Id"),
});

export const UpdateTestsSchema = Joi.object({
  testCategoryId: idRequired("Test Category Id"),

  data: arrayRequired("Updated Tests Data", UpdateTestItemSchema, 1),
});

/*-------------------------Investigation/Precedure validation----------------------*/
const PatientTestItemSchema = Joi.object({
  testId: idRequired("Test Id"),

  comment: strOptional("Comment"),

  processLocation: intOptional("Process Location", 0),
});

export const CreatePatientTestSchema = Joi.object({
  appointmentId: idRequired("Appointment Id"),

  data: arrayRequired("Patient Tests Data", PatientTestItemSchema, 1),
});

const UpdatePatientTestItemSchema = PatientTestItemSchema.keys({
  id: idOptional("Patient Test Id"),
});

export const UpdatePatientTestSchema = Joi.object({
  appointmentId: idRequired("Appointment Id"),

  data: arrayRequired(
    "Updated Patient Tests Data",
    UpdatePatientTestItemSchema,
    1
  ),
});

export const validateSearchTest = validationHandler({
  schema: SearchTestSchema,
});
export const validateCreateTestCategories = validationHandler({
  schema: CreateTestCategoriesSchema,
});
export const validateUpdateTestCategories = validationHandler({
  schema: UpdateTestCategoriesSchema,
});
export const validateCreateTests = validationHandler({
  schema: CreateTestsSchema,
});
export const validateUpdateTests = validationHandler({
  schema: UpdateTestsSchema,
});
export const validateCreatePatientTest = validationHandler({
  schema: CreatePatientTestSchema,
});
export const validateUpdatePatientTest = validationHandler({
  schema: UpdatePatientTestSchema,
});
