import express, { Request, Response, NextFunction } from "express";
import { body, query } from "express-validator";
import mongoose from "mongoose";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  currentUserMiddleWare,
  requireAuth,
  validate,
} from "@yalsharif/common";
import { Ticket } from "../models/Ticket";
import { Order } from "../models/Order";
import { orderCreationPublisher } from "../events/Publishers/OrderCreationPublisher";
import { natsServer } from "../events/Nats";
// import { TicketingCreationPublisher } from "../events/publishers/TicketingCreation";

const EXPAIRE_TIME_SECOUNDS = 15 * 60;

const router = express.Router();

// struct the user from the cookie
router.use(currentUserMiddleWare);

//@desc               Create an order to a specific ticket the order will be with Expire date till he finish the payment 30S
//@route              POST /api/orders
//@access             Private
router.post(
  "/",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom(async (input: string) => {
        let isValid = mongoose.Types.ObjectId.isValid(input);

        if (!isValid) {
          throw new Error();
        }
      })
      .withMessage("Valid Ticket Id Must be prvided"),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.body;
    // Ticket Id must be valid its temprory

    // Check if the ticket exist.
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return next(new NotFoundError("Ticket Does not exist"));
    }
    // Check if the user is the owner of the ticket => Ticket owner cannot buy his ticket

    // Check if the ticket reserved.
    let isReserved = await ticket.isReserved();
    if (isReserved) {
      return next(new NotAuthorizedError());
    }

    // Check this and see the expires time.
    // Calculate Expire Date.
    let expireDate = new Date();

    expireDate.setSeconds(expireDate.getSeconds() + EXPAIRE_TIME_SECOUNDS);

    // create the order and store it in the mongodb.
    const order = Order.build({
      userId: new mongoose.Types.ObjectId(req.currentUser?.id),
      status: OrderStatus.Created,
      expiration: new Date(expireDate),
      ticket,
    });

    await order.save();

    // Publish an event to the others services
    // Cancell the order event should Be published
    await orderCreationPublisher.publish({
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

    // Send response
    res.status(201).send({
      order,
    });
  }
);

export { router as CreateOrder };
