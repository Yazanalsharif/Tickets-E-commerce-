import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import express from "express";
import {
  BadRequestError,
  currentUserMiddleWare,
  requireAuth,
  validate,
} from "@yalsharif/common";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { natsServer } from "../events/Nats";
import { TicketingCreationPublisher } from "../events/publishers/TicketingCreation";

const router = express.Router();

// struct the user from the cookie
router.use(currentUserMiddleWare);

//@desc               Create specific Ticket
//@route              POST /api/tickets/:id
//@access             Private, Owner
router.post(
  "/",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .trim()
      .isFloat({ gt: 0 })
      .withMessage("Price should be Greater than 0"),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    let { title, price } = req.body;

    let userId = req.currentUser!.id;

    if (!userId) {
      return next(new BadRequestError("UNKNWON ERROR WITH THE USER"));
    }

    try {
      const ticket = Ticket.build({
        title,
        price,
        userId: new mongoose.Types.ObjectId(userId),
      });

      await ticket.save();

      // should I a wait for the publisher to publish the ticket
      await new TicketingCreationPublisher(natsServer.client).publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version,
      });

      res.status(201).send({
        message: "Ok",
        ticket,
      });
    } catch (err) {
      console.log("Error Here");
      console.log(err);
      // return next(new DataBaseError("Ticket not saved, DataBaseErrors"));
    }
  }
);

export { router as createTicket };
