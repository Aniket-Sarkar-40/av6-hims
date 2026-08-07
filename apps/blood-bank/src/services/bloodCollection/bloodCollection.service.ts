import { upsertBloodCollectionInDb } from "@/repository/bloodCollection/bloodCollection.repository.js";
import { CreateOrUpdateBloodCollection } from "@/types/bloodCollection/bloodCollection.js";
import { upsertBloodCollectionServiceValidation } from "@/validations/service/bloodCollection/bloodCollection.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";

export const bloodCollectionService = {
  async upsertBloodCollection(input: CreateOrUpdateBloodCollection) {
    logger.info("entering::upsertBloodCollection::service");
    await upsertBloodCollectionServiceValidation(input);

    await upsertBloodCollectionInDb(input);

    logger.info("exiting::upsertBloodCollection::service");
  },
};
