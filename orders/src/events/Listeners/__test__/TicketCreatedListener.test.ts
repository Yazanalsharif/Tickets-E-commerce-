import { ticketingCreation } from "@yalsharif/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { natsServer } from "../../Nats";
import { TicketCreatedListener } from "../TicketCreatedListener";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  // febricate the data came from the event
  const data: ticketingCreation["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "Test Ticket",
    userId: "lsjadlf;jsa",
    version: 0,
  };

  // Febricate the msg from the nats-server
  // @ts-ignore the typescript is ignored because I want to manibulate with the msg object and let him include only the ack function
  const msg: Message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
  };

  const TicketListenerInstance = new TicketCreatedListener(natsServer.client);

  return { TicketListenerInstance, msg, data };
};

test("Ticket created and saved in the ticket collection order service", async () => {
  const { TicketListenerInstance, msg, data } = await setup();
  // Call onMessage function

  await TicketListenerInstance.onMessage(data, msg);
  // Assert if the ticket saved in the ticket collection inside the order services

  const fetchedTicket = await Ticket.findById(data.id);
  expect(fetchedTicket).toBeDefined();
  expect(fetchedTicket!.title).toEqual(data.title);
  expect(fetchedTicket!.price).toEqual(data.price);
  expect(fetchedTicket!.version).toEqual(data.version);

  expect(msg.ack).toHaveBeenCalled();
});

test("Acknow function is called once the ticket succusfully created", async () => {
  // Setup the test function
  const { TicketListenerInstance, msg, data } = await setup();

  await TicketListenerInstance.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
