import { getCountItemsByMedCategoryFromDb } from "@/repository/item/item.repository.js";
import { MedCategoryDTO } from "@/types/master/medCategory.js";
import { MedCategory } from "@repo/db/generated/prisma/client";

export const toMedCategoryDTO = async (
  model: MedCategory,
): Promise<MedCategoryDTO> => {
  const countItem = await getCountItemsByMedCategoryFromDb(model.id);
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    minMarginB2CPercentage: model.minMarginB2CPercentage,
    minMarginB2BPercentage: model.minMarginB2BPercentage,
    loyaltyPercentage: model.loyaltyPercentage,
    createdBy: model.createdBy,
    updatedBy: model.updatedBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    itemCount: countItem,
  };
};

export const toMedCategoryDTOs = async (
  models: MedCategory[],
): Promise<MedCategoryDTO[]> => {
  return Promise.all(models.map(toMedCategoryDTO));
};
