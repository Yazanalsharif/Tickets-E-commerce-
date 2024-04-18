import { ValidationError } from "express-validator";

export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    // syntax required for the Typescript language
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  // The structure of the Error is errors: Array of errors object include message and field is optional
  abstract serlizedError(): { message: any; field?: string }[];
}
