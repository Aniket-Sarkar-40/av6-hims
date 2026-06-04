export type CommonFieldScalarValue = string | number | boolean | null | Date | Record<string, unknown> | unknown[];
export interface PrismaFieldMeta {
    name: string;
    type: string;
    kind: string;
    isList: boolean;
    isRequired: boolean;
}
export interface PrismaModelMeta {
    name: string;
    fields: PrismaFieldMeta[];
}
export declare const delegateKeyToModelName: (delegateKey: string) => string;
export declare const getPrismaModelMeta: (delegateKey: string) => PrismaModelMeta | null;
export declare const getModelScalarFieldNames: (delegateKey: string) => string[];
export declare const assertModelScalarField: (delegateKey: string, fieldName: string) => PrismaFieldMeta;
export declare const assertScalarFieldValue: (fieldMeta: PrismaFieldMeta, value: unknown) => CommonFieldScalarValue | Date;
export declare const validateModelFieldUpdate: (delegateKey: string, field: string, value: unknown) => {
    fieldMeta: PrismaFieldMeta;
    normalizedValue: CommonFieldScalarValue | Date;
};
//# sourceMappingURL=prismaModelField.utils.d.ts.map