import { ValidationErrorItem } from "joi";

export default class ErrorHandler extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public errors?: ValidationErrorItem[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
