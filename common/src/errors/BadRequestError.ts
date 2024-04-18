import { CustomError } from "./CustomError";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    // syntax required for the Typescript language
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serlizedError() {
    return [{ message: this.message }];
  }
}
