import express, { NextFunction, Request, Response } from "express";
import { Ticket } from "../models/Ticket";
import { Types } from "mongoose";
import {
  requireAuth,
  validate,
  currentUserMiddleWare,
  NotAuthorizedError,
  NotFoundError,
  BadRequestError,
} from "@yalsharif/common";
import { body } from "express-validator";
import { natsServer } from "../events/Nats";
import { TicketingUpdating } from "../events/publishers/TicketingUpdating";

const router = express.Router();
// current user middle ware to struct the cookie
router.use(currentUserMiddleWare);
router
  .route("/:id")
  .put(
    requireAuth,
    [
      body("title")
        .trim()
        .notEmpty()
        .optional()
        .withMessage("Title should not be emply"),
      body("price")
        .trim()
        .isFloat({ gt: 0 })
        .optional()
        .withMessage("Price should be Greater than 0"),
    ],
    validate,
    async (req: Request, res: Response, next: NextFunction) => {
      let { title, price } = req.body;

      if (!title && !price) {
        return next(new BadRequestError("Title or price should be provided"));
      }

      // check if the valid object id has been provided
      if (!req.params.id || !Types.ObjectId.isValid(req.params.id)) {
        return next(
          new NotFoundError("Ticket Not Found, Please Enter valid Id")
        );
      }

      try {
        let ticket = await Ticket.findById(req.params.id);

        // check if the ticket exist
        if (!ticket) {
          return next(
            new NotFoundError("Ticket Not Found, Please Enter valid Id")
          );
        }

        // check if the use is the owner of the ticket
        if (ticket.userId !== req.currentUser!.id) {
          return next(new NotAuthorizedError());
        }

        if (ticket.orderId) {
          return next(
            new BadRequestError("The Reserved ticket can not be updated.")
          );
        }

        ticket.set({ title, price });
        // may it occur a version error
        await ticket.save();

        // to increase the version, its a temprory solution
        new TicketingUpdating(natsServer.client).publish({
          id: ticket!.id,
          title: ticket!.title,
          price: ticket!.price,
          userId: ticket!.userId,
          version: ticket!.version,
        });

        // return the response
        res.status(200).json({
          ticket,
        });
      } catch (error) {
        console.log("ERROR IN UPDATE TICKET / TICKET SERVICE");
        console.log(error);
      }
    }
  );

export { router as updateTicketRouter };
