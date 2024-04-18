import express from "express";

// import the route controllers
import { currentUser, signin, signout, signup } from "../controller/users";

import {
  currentUserMiddleWare,
  validateSignup,
  validate,
  validateSignIn,
} from "@yalsharif/common";

const router = express.Router();

// signup route
router.route("/signup").post(validateSignup, validate, signup);

// signin route
router.route("/signin").post(validateSignIn, validate, signin);

// signout
router.route("/signout").post(signout);

router.route("/currentUser").post(currentUserMiddleWare, currentUser);

export { router as userRouter };
