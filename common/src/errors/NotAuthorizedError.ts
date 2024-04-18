import { CustomError } from "./CustomError";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  constructor() {
    super("Not Authorized User...");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  serlizedError() {
    return [
      {
        message: "Not Authorized...",
      },
    ];
  }
}
