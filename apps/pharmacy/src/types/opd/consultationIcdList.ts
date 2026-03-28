export interface ConsultationIcdTenListRow {
  id: number;
  appointmentId: number;
  appointmentNo: string;
  consultationId: number | null;
  icd10Id: number;
  isActive: "yes" | "no";
  attendance: string | null;
  type: "principal" | "provisional";
  statusOfDiagnosis: "new" | "old";
  category: "primary" | "additional" | null;
  adverseEffect: string | null;
  dgrgCode: string | null;
  appointmentDate: string;
  icdSpecificCode: string;
  icdDescription: string;
}
