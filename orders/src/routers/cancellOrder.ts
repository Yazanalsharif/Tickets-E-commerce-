import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order";
import {
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  currentUserMiddleWare,
  requireAuth,
  OrderStatus,
} from "@yalsharif/common";
import { OrderCancellPublisher } from "../events/Publishers/OrderCancelletion";
import { natsServer } from "../events/Nats";
const router = express.Router();

// struct the user from the cookie
router.use(currentUserMiddleWare);

// The http method should be not Delete it should be PUT OR PATCH as we are only changing the status of the order
//@desc               Cancell the order by changing the status to Cancell
//@route              Delete /api/orders/:orderId
//@access             Private
router.put(
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
    const order = await Order.findById(orderId).populate("ticket");
    // Check if the user is the owner of the order
    if (!order) {
      return next(new NotFoundError("The Order is not Found"));
    }

    // check if the user is the owner of the order
    if (order.userId.toHexString() !== userId) {
      return next(new NotFoundError("The Order is not Found"));
    }

    order.status = OrderStatus.Cancelled;

    // Save the order
    await order.save();

    console.log(order.ticket);
    // Cancell the order event should Be published
    new OrderCancellPublisher(natsServer.client).publish({
      id: order.id,
      userId: order.userId.toString(),
      expiration: order.expiration.toISOString(),
      status: order.status,
      version: order.version,
      ticket: {
        id: order.ticket.id,
        title: order.ticket.title,
        price: order.ticket.price,
        version: order.ticket.version,
      },
    });

    res.status(204).send({
      message: "Ok",
      order,
    });
  }
);

export { router as cancellOrderRouter };
