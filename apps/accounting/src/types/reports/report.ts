export type ReportCommonRequestInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  includeZero?: boolean;
  ageing?: AgeingInput;
};

export type AgeingBucketInput = {
  from: number;
  to: number;
};

export type AgeingInput = {
  buckets: AgeingBucketInput[];
};
