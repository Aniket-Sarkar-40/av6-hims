export interface MedCategoryInput {
  id?: number;
  name: string;
  description?: string | null;
  minMarginB2CPercentage?: number | undefined;
  minMarginB2BPercentage?: number | undefined;
  loyaltyPercentage?: number | undefined;
}

export interface MedCategoryDTO {
  id: number;
  name: string;
  description: string | null;
  minMarginB2CPercentage: number;
  minMarginB2BPercentage: number;
  loyaltyPercentage: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  itemCount: number;
}
