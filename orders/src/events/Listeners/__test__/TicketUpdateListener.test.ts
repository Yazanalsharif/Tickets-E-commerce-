import { ticketingUpdating } from "@yalsharif/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { natsServer } from "../../Nats";
import { Ticket } from "../../../models/Ticket";
import { TicketUpdateListener } from "../TicketUpdateListener";

const setup = async () => {
  // Create the Ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "Test Ticket",
    price: 100,
  });

  await ticket.save();
  console.log("The version", ticket.version);
  // febricate the data came from the event
  const data: ticketingUpdating["data"] = {
    id: ticket.id,
    price: ticket.price,
    title: ticket.title,
    userId: "lsjadlf;jsa",
    version: ticket.version + 1,
  };

  // Febricate the msg from the nats-server
  // @ts-ignore the typescript is ignored because I want to manibulate with the msg object and let him include only the ack function
  const msg: Message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
  };

  const TicketUpdatedInstance = new TicketUpdateListener(natsServer.client);

  return { TicketUpdatedInstance, msg, data };
};

test("finds, update and save the updated tickets", async () => {
  const { TicketUpdatedInstance, msg, data } = await setup();
  // Call onMessage function

  await TicketUpdatedInstance.onMessage(data, msg);
  // Assert the data

  // fetch the ticket
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.version).toEqual(data.version);
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

test("ack message should be called when you update the ticket", async () => {
  const { TicketUpdatedInstance, msg, data } = await setup();
  // Call onMessage function

  await TicketUpdatedInstance.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

// Test out of order scinario
test("if concurrency issue occured The ack message does not call", async () => {
  const { TicketUpdatedInstance, msg, data } = await setup();

  data.version = 10;

  await TicketUpdatedInstance.onMessage(data, msg);

  expect(msg.ack).not.toHaveBeenCalled();
});
