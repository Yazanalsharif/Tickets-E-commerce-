import { CustomError } from "./CustomError";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string) {
    super(message);
    // syntax required for the Typescript language
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serlizedError() {
    return [
      {
        message: this.message,
      },
    ];
  }
}
