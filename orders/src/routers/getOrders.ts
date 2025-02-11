import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order";
import {
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  currentUserMiddleWare,
  requireAuth,
} from "@yalsharif/common";

const router = express.Router();

// struct the user from the cookie
router.use(currentUserMiddleWare);

//@desc               Get the orders that the user created
//@route              GET /api/orders
//@access             Private
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the user Id from the currentuser middleware after passing to require auth

    const orders = await Order.find({
      userId: req.currentUser!.id,
    }).populate("ticket");

    res.status(200).send({
      message: "Ok",
      orders,
    });
  }
);

//@desc               Get the order by specific orderId
//@route              GET /api/orders/:orderId
//@access             Private
router.get(
  "/:orderId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the user Id from the currentuser middleware after passing to require auth
    let userId = req.currentUser!.id;
    let { orderId } = req.params;

    // Check if the orderId is valid
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new BadRequestError("Please Enter the Valid Id"));
    }

    // Check if the order exist
    const order = await Order.findById(orderId);
    // Check if the user is the owner of the order
    if (!order) {
      return next(new NotFoundError("The Order is not Found"));
    }

    // check if the user is the owner of the order
    if (order.userId.toHexString() !== userId) {
      return next(new NotAuthorizedError());
    }

    // return the order
    res.status(200).send({
      message: "Ok",
      order,
    });
  }
);

export { router as getOrdersRouter };
