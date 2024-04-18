import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      errors: err.serlizedError(),
    });
  }

  // Handle object Id error
  console.log(err);
  // return 500 error
  res.status(500).json({
    message: "Something went wrong....",
  });
}

export { errorHandler };
