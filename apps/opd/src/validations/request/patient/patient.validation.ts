import { PatientReq } from "@/types/patient/patient.js";
import {
  dateRequired,
  emailOptional,
  emailRequired,
  enumOptional,
  idOptional,
  idRequired,
  intOptional,
  phoneOptional,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const patientsSchema = Joi.object<PatientReq>({
  admissionDate: strOptional("Admission Date"),

  patientName: strRequired("Patient Name", 3, 100).allow(null),

  age: strRequired("Age", 1, 3),

  month: strRequired("Month", 1, 20),

  days: strOptional("Days", 50),

  image: strOptional("Image", 255),

  mobileNo: phoneRequired("Mobile Number"),

  email: emailRequired("Email").allow(null),

  dob: dateRequired("Dob"),

  gender: strRequired("Gender", 1, 50),

  maritalStatus: strOptional("Marital Status", 50),

  bloodGroup: strOptional("Blood Group", 10),

  address: strRequired("Address", 255)
    .min(5)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Address",
        "5",
      ),
    }),

  guardianName: strOptional("Guardian Name", 100)
    .min(3)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Guardian Name",
        "3",
      ),
    }),

  guardianPhone: phoneOptional("Guardian Phone"),

  guardianAddress: strOptional("Guardian Address", 255),

  guardianEmail: emailOptional("Guardian Email"),

  discharged: strOptional("Discharged", 100),

  patientType: strOptional("Patient Type", 100),

  creditLimit: strOptional("Credit Limit", 50),

  organization: strOptional("Organization", 100),

  knownAllergies: strOptional("Known Allergies", 200),

  oldPatient: strOptional("Old Patient", 100),

  note: strOptional("Note"),

  isIpd: strOptional("Is IPD", 3)
    .min(2)
    .messages({
      "string.min": generateValidationErrorMessage("STRING_MIN", "Is IPD", "2"),
    }),

  ccId: idOptional("Collection Center ID"),

  isMaster: enumOptional("Is Master", { ML: "ML", CC: "CC" }),

  aadhar: strOptional("Aadhar", 12)
    .min(12)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Aadhar",
        "12",
      ),
    }),

  passport: strOptional("Passport", 100)
    .min(3)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Passport",
        "3",
      ),
    }),

  nationality: strOptional("Nationality", 100),

  area: strOptional("Area", 100),

  pinCode: strOptional("PinCode", 100),

  height: strOptional("Height", 100),

  weight: strOptional("Weight", 100),

  patientCode: strOptional("Patient Code", 100),

  userLogin: strOptional("User Login", 100),

  state: strOptional("State", 100),

  userRelationship: strOptional("User Relationship", 100),

  pid: strOptional("PID", 100),

  localId: strOptional("Local ID", 100),

  street: strOptional("Street", 255),

  city: strOptional("City", 100),

  pinCode2: strOptional("Pin Code 2", 10),

  country: intOptional("Country"),

  remarks: strOptional("Remarks"),

  patientImage: strOptional("Patient Image"),

  emergencyFirstName: strOptional("Emergency First Name"),

  emergencyLastName: strOptional("Emergency Last Name"),

  emergencyRelation: strOptional("Emergency Relation"),

  emergencyPhoneNumber: phoneOptional("Emergency Phone Number"),

  emergencyEmail: emailOptional("Emergency Email"),

  emergencyMaritalStatus: strOptional("Emergency Marital Status", 50),

  emergencyAddress: strOptional("Emergency Address"),

  emergencyState: strOptional("Emergency State", 100),

  emergencyCountry: strOptional("Emergency Country", 100),

  patientSignature: strOptional("Patient Signature"),

  patientOccupation: strOptional("Patient Occupation"),
  employeeId: strOptional("Employee ID"),
  clientId: idOptional("Client ID"),
});

export const validatePatients = validationHandler({
  schema: patientsSchema,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "image", path: "image" },
    { key: "patientImage", path: "patientImage" },
    { key: "patientSignature", path: "patientSignature" },
  ],
});

export const patientsSchemaUpdate = patientsSchema.keys({
  id: idRequired("Patient ID"),
});

export const validatePatientsUpdate = validationHandler({
  schema: patientsSchemaUpdate,
  type: "FORMDATA_WITH_MULTIPLE_DOCS",
  multipleDocsAttr: [
    { key: "image", path: "image" },
    { key: "patientImage", path: "patientImage" },
    { key: "patientSignature", path: "patientSignature" },
  ],
});
