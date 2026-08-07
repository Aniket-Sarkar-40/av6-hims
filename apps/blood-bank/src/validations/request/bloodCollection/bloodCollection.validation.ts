import {
  BloodCollectionItem,
  CreateOrUpdateBloodCollection,
} from "@/types/bloodCollection/bloodCollection.js";
import {
  BloodBagType,
  BloodCollectionItemStatus,
  BloodCollectionSourceType,
  BloodDonationType,
  BloodCollectionStatus,
} from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  dateOptional,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const collectionItemSchema = Joi.object<BloodCollectionItem>({
  id: idOptional("Answer Id"),
  isManualUnitNo: boolRequired("Is Manual Unit No"),
  batchNo: strOptional("Batch No"),
  bagType: enumOptional("Bag Type", BloodBagType),
  preliminaryBloodGroup: enumOptional(
    "Preliminary Blood Group",
    BloodDonationType,
  ),
  quantityMl: intRequired("Quantity (ml)"),
  collectionDate: dateOptional("Collection Date"),
  bagExpiryDate: dateOptional("Bag Expiry Date"),
  status: enumRequired("Status", BloodCollectionItemStatus),
  isStockPosted: boolRequired("Is Stock Posted"),
  stockPostedAt: dateOptional("Stock Posted At"),
  stockPostedByStaffId: idOptional("Stock Posted By Staff Id"),
  rejectReason: strOptional("Reject Reason"),
  remark: strOptional("Remarks"),
});

export const upsertBloodCollectionSchema =
  Joi.object<CreateOrUpdateBloodCollection>({
    id: idOptional("Id"),
    bloodBankCenterId: idRequired("Blood Bank Center Id"),
    physicalExamId: idOptional("Physical Exam Id"),
    collectionNo: strOptional("Collection No"),
    sourceType: enumRequired("Source Type", BloodCollectionSourceType),
    donorId: idOptional("Donor Id"),
    externalCenterId: idOptional("External Center Id"),
    donationType: enumOptional("Donation Type", BloodDonationType),
    collectionDate: dateOptional("Collection Date"),
    receivedAt: dateOptional("Received At"),
    receivedByStaffId: idOptional("Received By Staff Id"),
    externalReferenceNo: strOptional("External Reference No"),
    externalDocumentNo: strOptional("External Document No"),
    status: enumRequired("Status", BloodCollectionStatus),
    remark: strOptional("Remarks"),
    collectionItems: arrayRequired("Collection Items", collectionItemSchema, 1),
  });

export const validateUpsertBloodCollection = validationHandler({
  schema: upsertBloodCollectionSchema,
});
