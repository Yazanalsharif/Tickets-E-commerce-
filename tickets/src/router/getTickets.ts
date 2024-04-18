import express, { NextFunction, Request, Response } from "express";
import { Ticket, TicketsDoc } from "../models/Ticket";
import { Types } from "mongoose";
import { NotFoundError } from "@yalsharif/common";

const router = express.Router();

//@desc               Get the whole tickets
//@route              GET /api/tickets/
//@access             puplic
router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    let tickets: TicketsDoc[] = [];

    tickets = await Ticket.find({});

    res.status(200).json({
      message: "Ok",
      tickets,
    });
  });

//@desc               Get specific tickets
//@route              GET /api/tickets/:id
//@access             puplic
router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        return next(new NotFoundError("Ticket Doesn't Exist"));
      }

      let ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return next(new NotFoundError("Ticket Doesn't Exist"));
      }

      res.status(200).json({
        ticket,
      });
    } catch (err) {
      console.log(err);
    }
  });

//@desc               Get all owned tickets
//@route              GET /api/tickets/mytickets
//@access             Private

export { router as getTicketsRouter };
