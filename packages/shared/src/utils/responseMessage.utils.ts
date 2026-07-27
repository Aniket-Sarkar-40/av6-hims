import {
  ErrorMessageType,
  SuccessMessageType,
  ValidationErrorMessage,
} from "../enums/message.enum.js";
import ErrorHandler from "./errorHandler.utils.js";

export function capitalizeFirstLetter(title: string): string {
  const value = title.toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMessage(message: string, ...variables: string[]): string {
  const parsedMessage = variables.reduce((formatted, variable, index) => {
    const placeholder = `%${index + 1}`;
    return formatted.replace(placeholder, variable);
  }, message);

  return capitalizeFirstLetter(parsedMessage).trim();
}

export function generateSuccessMessage(
  type: keyof typeof SuccessMessageType,
  ...variables: string[]
): string {
  const successMsg = SuccessMessageType[type];
  return formatMessage(successMsg, ...variables);
}

export function generateErrorMessage(
  type: keyof typeof ErrorMessageType,
  ...variables: string[]
): string {
  const errorMsg = ErrorMessageType[type];
  return formatMessage(errorMsg, ...variables);
}

export function generateValidationErrorMessage(
  type: keyof typeof ValidationErrorMessage,
  ...variables: string[]
): string {
  const errorMsg = ValidationErrorMessage[type];
  return formatMessage(errorMsg, ...variables);
}

export const ensureMatch = <T>(
  bodyValue: T | undefined | null,
  leadValue: T | null,
  bodyLabel: string,
  leadLabel: string,
) => {
  if (
    bodyValue !== undefined &&
    bodyValue !== null &&
    leadValue !== null &&
    bodyValue !== leadValue
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `${bodyLabel} (${bodyValue})`,
        `${leadLabel} (${leadValue})`,
      ),
    );
  }
};
