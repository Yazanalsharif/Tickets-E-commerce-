import { CustomError } from "./CustomError";

export class DataBaseError extends CustomError {
  // status code should be like 500
  statusCode = 500;

  constructor(public message: string) {
    super(message);

    // Without this statment, The type script will not listen to the functions
    Object.setPrototypeOf(this, DataBaseError.prototype);
  }

  serlizedError() {
    return [{ message: this.message }];
  }
}
