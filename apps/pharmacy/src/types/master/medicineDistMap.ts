export interface MedicineDistMapReq {
  id?: number;
  itemId: number;
  distributorId: number;
  price: number;
  expiryDate?: Date;
}
