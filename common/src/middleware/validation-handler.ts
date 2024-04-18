import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidation } from "../errors/RequestValidation";

// Validate array used by express-validator as a middle ware before the main controller
let validateSignup = [
  body("email").isEmail().withMessage("The email is unvalid"),
  body("password")
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("The password length must be between 8 - 20 letters/numbers"),
];

async function validate(req: Request, res: Response, next: NextFunction) {
  let errors = validationResult(req);

  // check if there are any validation errors
  if (!errors.isEmpty()) {
    return next(new RequestValidation(errors.array()));
  }

  next();
}

let validateSignIn = [
  body("email").isEmail().withMessage("The email is unvalid"),
];

export { validateSignup, validate, validateSignIn };
