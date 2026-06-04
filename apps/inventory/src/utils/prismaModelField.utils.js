import { db } from "@repo/db/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
const runtimeDataModel = db._runtimeDataModel;
const models = Array.isArray(runtimeDataModel.models)
    ? runtimeDataModel.models
    : Object.values(runtimeDataModel.models ?? {});
const enums = Array.isArray(runtimeDataModel.enums)
    ? runtimeDataModel.enums
    : Object.values(runtimeDataModel.enums ?? {});
const BLOCKED_FIELDS = new Set([
    "id",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "canceledAt",
    "cancelledAt",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "canceledBy",
    "cancelledBy",
]);
const MODEL_BY_NAME = new Map(models.map((model) => [model.name, model]));
const MODEL_BY_DELEGATE = new Map(models.map((model) => [
    model.name.charAt(0).toLowerCase() + model.name.slice(1),
    model,
]));
const ENUM_VALUES_BY_NAME = new Map(enums.map((enumMeta) => [
    enumMeta.name,
    (enumMeta.values ?? []).map((value) => typeof value === "string" ? value : value.name),
]));
const toModelName = (delegateKey) => delegateKey.charAt(0).toUpperCase() + delegateKey.slice(1);
const invalidField = (field) => {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", field ?? ""));
};
const invalidTable = () => {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_TABLE"));
};
const invalidValue = (field, expected) => {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_VALUE", `${field} (expected ${expected})`));
};
export const delegateKeyToModelName = toModelName;
export const getPrismaModelMeta = (delegateKey) => {
    return (MODEL_BY_DELEGATE.get(delegateKey) ??
        MODEL_BY_NAME.get(delegateKey) ??
        MODEL_BY_NAME.get(toModelName(delegateKey)) ??
        null);
};
const getModelMeta = (delegateKey) => {
    const model = getPrismaModelMeta(delegateKey);
    if (!model) {
        return invalidTable();
    }
    return model;
};
export const getModelScalarFieldNames = (delegateKey) => {
    return getModelMeta(delegateKey)
        .fields.filter((field) => (field.kind === "scalar" || field.kind === "enum") && !field.isList)
        .map((field) => field.name);
};
export const assertModelScalarField = (delegateKey, fieldName) => {
    if (BLOCKED_FIELDS.has(fieldName)) {
        return invalidField(fieldName);
    }
    const field = getModelMeta(delegateKey).fields.find((item) => item.name === fieldName &&
        (item.kind === "scalar" || item.kind === "enum") &&
        !item.isList);
    if (!field) {
        return invalidField(fieldName);
    }
    return field;
};
const isValidDate = (value) => !Number.isNaN(value.getTime());
const isJsonObjectOrArray = (value) => {
    if (value === null || value === undefined)
        return false;
    if (typeof value === "function")
        return false;
    if (typeof value === "symbol")
        return false;
    if (typeof value === "bigint")
        return false;
    try {
        JSON.stringify(value);
        return typeof value === "object";
    }
    catch {
        return false;
    }
};
const normalizeEnumValue = (field, value) => {
    const allowedValues = ENUM_VALUES_BY_NAME.get(String(field.type));
    if (!allowedValues) {
        return invalidValue(field.name, String(field.type));
    }
    if (typeof value !== "string") {
        return invalidValue(field.name, `one of [${allowedValues.join(", ")}]`);
    }
    if (!allowedValues.includes(value)) {
        return invalidValue(field.name, `one of [${allowedValues.join(", ")}]`);
    }
    return value;
};
const normalizeScalarValue = (field, value) => {
    if (value === undefined) {
        return invalidValue(field.name, "a value");
    }
    if (value === null) {
        if (field.isRequired) {
            return invalidValue(field.name, "non-null value");
        }
        return null;
    }
    switch (field.type) {
        case "String":
            if (typeof value !== "string") {
                return invalidValue(field.name, "string");
            }
            return value;
        case "Boolean":
            if (typeof value !== "boolean") {
                return invalidValue(field.name, "boolean");
            }
            return value;
        case "Int":
            if (typeof value !== "number" || !Number.isInteger(value)) {
                return invalidValue(field.name, "integer");
            }
            return value;
        case "Float":
            if (typeof value !== "number" || !Number.isFinite(value)) {
                return invalidValue(field.name, "number");
            }
            return value;
        case "BigInt":
            if (typeof value === "number" && Number.isInteger(value)) {
                return value;
            }
            if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
                return value;
            }
            return invalidValue(field.name, "integer or numeric string");
        case "Decimal":
            if (typeof value === "number" && Number.isFinite(value)) {
                return value;
            }
            if (typeof value === "string" &&
                value.trim() !== "" &&
                Number.isFinite(Number(value))) {
                return value;
            }
            return invalidValue(field.name, "number or decimal string");
        case "DateTime": {
            if (value instanceof Date && isValidDate(value)) {
                return value;
            }
            if (typeof value === "string") {
                const dateValue = new Date(value);
                if (isValidDate(dateValue)) {
                    return dateValue;
                }
            }
            return invalidValue(field.name, "valid date string or Date");
        }
        case "Json":
            if (isJsonObjectOrArray(value)) {
                return value;
            }
            return invalidValue(field.name, "object or array");
        case "Bytes":
            if (typeof value === "string") {
                return value;
            }
            return invalidValue(field.name, "string");
        default:
            return invalidValue(field.name, String(field.type));
    }
};
export const assertScalarFieldValue = (fieldMeta, value) => {
    if (fieldMeta.kind === "enum") {
        return normalizeEnumValue(fieldMeta, value);
    }
    return normalizeScalarValue(fieldMeta, value);
};
export const validateModelFieldUpdate = (delegateKey, field, value) => {
    const fieldMeta = assertModelScalarField(delegateKey, field);
    const normalizedValue = assertScalarFieldValue(fieldMeta, value);
    return {
        fieldMeta,
        normalizedValue,
    };
};
