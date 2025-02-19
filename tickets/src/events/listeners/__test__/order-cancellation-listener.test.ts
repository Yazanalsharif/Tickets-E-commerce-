import { Ticket } from "../../../models/Ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelletion, OrderStatus, Subjects } from "@yalsharif/common";
import { OrderCancelletionListener } from "../order-cancellation-listener";
import { natsServer } from "../../Nats";
const setup = async () => {
  let orderId = new mongoose.Types.ObjectId();
  // Create the ticket you would like to cancel
  const ticket = Ticket.build({
    title: "Test Ticket",
    price: 10,
    userId: new mongoose.Types.ObjectId(),
  });

  await ticket.save();
  ticket.set({
    orderId,
  });

  await ticket.save();

  // Faking the msg Type
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
  };

  // Faking the data
  const data: OrderCancelletion["data"] = {
    id: orderId.toHexString(),
    expiration: "slajdfa",
    status: OrderStatus.AwaitingPayment,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
    },
  };

  // orderCreation listener Instance
  const OrderCancelletionInstance = new OrderCancelletionListener(
    natsServer.client
  );

  return { OrderCancelletionInstance, data, ticket, msg };
};

test("The ticket order is cancelled the reservition is done by removing the orderId from the ticket", async () => {
  const { OrderCancelletionInstance, data, msg } = await setup();

  await OrderCancelletionInstance.onMessage(data, msg);

  // get the ticket and check if it has reserved or not
  const fetchedTicket = await Ticket.findById(data.ticket.id);

  // Expect its reserved because it has the orderId
  expect(fetchedTicket?.orderId).not.toBeDefined();
  expect(fetchedTicket?.id).toEqual(data.ticket.id);
  expect(fetchedTicket?.version).toEqual(2);
});

test("ack the message in the order creation listener to knowladge nats that the event handled", async () => {
  const { OrderCancelletionInstance, data, msg } = await setup();

  await OrderCancelletionInstance.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

test("The Ticket service will emit a TicketUpdate Event when the order cancelled, to Inform other services with the update that just happened", async () => {
  const { OrderCancelletionInstance, data, msg } = await setup();

  await OrderCancelletionInstance.onMessage(data, msg);

  // get the ticket and check if it has reserved or not
  expect(natsServer.client.publish).toHaveBeenCalled();

  const updatedData = JSON.parse(
    (natsServer.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(updatedData.id).toEqual(data.ticket.id);
  // Because the updated ticket the version should be increased
  expect(updatedData.version).toEqual(data.ticket.version + 1);
});
