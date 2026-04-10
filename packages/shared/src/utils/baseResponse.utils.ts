import { ApiResponse, ErrorCode } from "@/types/global.js";
import { ValidationErrorItem } from "joi";
import ErrorHandler from "./errorHandler.utils.js";
import { SuccessMessageType } from "@/enums/message.enum.js";
import { generateSuccessMessage } from "./responseMessage.utils.js";
import { DecimalToNumber, toNumberDeep } from "./helper.utils.js";

export class BaseResponse<T> {
  public success: boolean;
  public data?: DecimalToNumber<NonNullable<T>>;
  public errors?: ValidationErrorItem[];
  public message!: string;
  public errorCode!: ErrorCode;
  public errorMessage!: string;
  public err!: ErrorHandler;

  constructor(response: ApiResponse, data?: T) {
    if (data) this.data = toNumberDeep(data);
    this.success = response.success;
    if (response.errors) this.errors = response.errors;
    if (response.errorCode) this.errorCode = response.errorCode;
    if (response.errorMessage) this.errorMessage = response.errorMessage;
    if (response.message) this.message = response.message;
    if (response.err) this.err = response.err;
  }

  /* static shortcuts */
  static success<T>(
    {
      data,
      type,
    }: {
      data?: T;
      type: keyof typeof SuccessMessageType;
    },
    ...variables: string[]
  ): BaseResponse<T> {
    return new BaseResponse<T>(
      { success: true, message: generateSuccessMessage(type, ...variables) },
      data
    );
  }

  /* static shortcuts */
  static successCustomMsg<T>({
    data,
    message = "Success",
  }: {
    data?: T;
    message: string;
  }): BaseResponse<T> {
    return new BaseResponse<T>({ success: true, message }, data);
  }

  static error<T = undefined>(options: {
    message?: string;
    errors?: ValidationErrorItem[];
    errorCode?: ErrorCode;
    errorMessage?: string;
    err?: ErrorHandler;
  }): BaseResponse<T> {
    return new BaseResponse<T>({ success: false, ...options });
  }

  static errorCustomMsg<T>({
    data,
    message = "Error",
  }: {
    data?: T;
    message: string;
  }): BaseResponse<T> {
    return new BaseResponse<T>({ success: false, message }, data);
  }
}
