import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderStatus, OrderCancelletion, Subjects } from "@yalsharif/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../Nats";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "asldkfj",
    version: 0,
  });
  await order.save();

  const data: OrderCancelletion["data"] = {
    id: order.id,
    expiration: "expiration Test",
    userId: "asldkfj",
    version: 1,
    status: OrderStatus.Cancelled,
    ticket: {
      id: "asldkfj",
      title: "Ticket Test",
      price: 50,
      version: 1,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("updates the status of the order", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
