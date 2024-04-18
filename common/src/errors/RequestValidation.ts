import { CustomError } from "./CustomError";
import { ValidationError } from "express-validator";

export class RequestValidation extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    // Send the message and store it as a message
    super("Validation Error: Bad Request");

    // syntax required for the Typescript language
    Object.setPrototypeOf(this, RequestValidation.prototype);
  }

  serlizedError() {
    return this.errors.map((err) => {
      return {
        message: err.msg,
        field: err.type,
      };
    });
  }
}
