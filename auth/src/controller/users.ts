import { Request, Response, NextFunction } from "express";
import { PasswordManager } from "../services/PasswordManager";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import {
  NotAuthorizedError,
  DataBaseError,
  RequestValidation,
  BadRequestError,
} from "@yalsharif/common";

//@desc               signup new user in the system
//@route              POST /api/users/signup
//@access             puplic
async function signup(req: Request, res: Response, next: NextFunction) {
  let { email, password } = req.body;

  let checkUser = await User.findOne({ email });

  if (checkUser) {
    return next(new DataBaseError("The email is already used"));
  }

  let user = User.build({ email, password });

  await user.save();

  let jwtToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    // ! for let typescript know that I verified that JWT_KEY will be always defined
    process.env.JWT_KEY!
  );

  req.session = {
    token: jwtToken,
  };

  // return the response
  return res.status(201).send({
    message: "Ok",
    user,
  });
}

//@desc               sign in the user in the system
//@route              POST /api/users/signin
//@access             puplic
async function signin(req: Request, res: Response, next: NextFunction) {
  let { email, password } = req.body;

  let userExesting = await User.findOne({ email });

  if (!userExesting) {
    return next(new BadRequestError("User Doesn't exist"));
  }

  let isPasswordCorrect = await PasswordManager.compare(
    password,
    userExesting?.password as string
  );

  if (!isPasswordCorrect) {
    return next(new BadRequestError("Invalid credentials"));
  }

  // Create Jwt
  let jwtToken = jwt.sign(
    {
      id: userExesting.id,
      email: userExesting.email,
    },
    // ! for let typescript know that I verified that JWT_KEY will be always defined
    process.env.JWT_KEY!
  );

  req.session = {
    token: jwtToken,
  };

  res.status(200).send({
    message: "Ok",
    user: userExesting,
  });
}

//@desc               sign in the user in the system
//@route              POST /api/users/signin
//@access             private
async function currentUser(req: Request, res: Response, next: NextFunction) {
  res.status(200).send({
    message: "Ok",
    currentUser: req.currentUser || null,
  });
}

//@desc               sign in the user in the system
//@route              POST /api/users/signin
//@access             puplic
async function signout(req: Request, res: Response, next: NextFunction) {
  req.session = null;
  res.status(200).send({
    message: "Ok",
  });
}

export { signup, signin, signout, currentUser };
