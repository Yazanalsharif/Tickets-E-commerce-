import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreation, OrderStatus } from "@yalsharif/common";
import { natsWrapper } from "../../Nats";
import { OrderCreationListener } from "../order-creation-listener";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreationListener(natsWrapper.client);

  const data: OrderCreation["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiration: "alskdjf",
    userId: "alskdjf",
    status: OrderStatus.Created,
    ticket: {
      id: "alskdfj",
      price: 10,
      title: "Test Ticket",
      version: 1,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
