export type IdValue<TId = number, TValue = string> = {
  id: TId;
  value: TValue;
};
type AuditKeys = keyof Deletevalues;
export type WithoutAudit<T> = Omit<T, AuditKeys>;
export interface Deletevalues {
  isActive: boolean;
  createdBy: number;
  updatedBy: string;
  deletedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
