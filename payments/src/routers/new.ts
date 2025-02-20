import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { stripe } from "../stripe";
import {
  requireAuth,
  validate,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  currentUserMiddleWare,
} from "@yalsharif/common";
// import { stripe } from "../stripe";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { paymentCreationPublisher } from "../events/Publishers/PaymentCreationPublisher";

const router = express.Router();

// struct the user from the cookie
router.use(currentUserMiddleWare);

//@desc               Create a new payment to finish a specific order
//@route              POST /api/payments/
//@access             Private
router.post(
  "/",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(
        new NotFoundError(`The order with Id ${orderId} does not exist`)
      );
    }

    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    if (order.status === OrderStatus.Cancelled) {
      return next(new BadRequestError("Cannot pay for an cancelled order"));
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();
    await paymentCreationPublisher.publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
