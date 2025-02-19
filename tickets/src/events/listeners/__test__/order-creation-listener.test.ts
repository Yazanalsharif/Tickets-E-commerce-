import { Ticket } from "../../../models/Ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreation, OrderStatus, Subjects } from "@yalsharif/common";
import { OrderCreationListener } from "../order-creation-listener";
import { OrderCreationListener1 } from "../order-createion-listener-kafka";
import { natsServer } from "../../Nats";
import { kafkaWrapper } from "../../kafkaWrapper";
import { Kafka, EachMessagePayload, KafkaMessage, Consumer } from "kafkajs";

const setup = async () => {
  // Create the ticket
  const ticket = Ticket.build({
    title: "Test Ticket",
    price: 10,
    userId: new mongoose.Types.ObjectId(),
  });
  await ticket.save();

  // Faking the msg Type
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
  };

  // Faking the payload
  const payload: EachMessagePayload = {
    topic: "Test-topic",
    partition: 1,
    // @ts-ignore
    message: {
      offset: "1",
    },
    heartbeat: jest.fn(),
    pause: jest.fn(),
  };

  // Faking the data
  const data: OrderCreation["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
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
  const orderCreationListener = new OrderCreationListener(natsServer.client);
  const orderCreationListener1 = new OrderCreationListener1(
    kafkaWrapper.client
  );

  return {
    orderCreationListener,
    orderCreationListener1,
    data,
    ticket,
    msg,
    payload,
  };
};

test("The ticket is reserved and the orderId found once the order created to the ticket", async () => {
  const { orderCreationListener, data, msg } = await setup();

  await orderCreationListener.onMessage(data, msg);

  // get the ticket and check if it has reserved or not
  const fetchedTicket = await Ticket.findById(data.ticket.id);

  // Expect its reserved because it has the orderId
  expect(fetchedTicket?.orderId).not.toBeNull();
  expect(fetchedTicket?.orderId?.toHexString()).toEqual(data.id);
  expect(fetchedTicket?.id).toEqual(data.ticket.id);
  expect(fetchedTicket?.version).toEqual(1);
});

test("ack the message in the order creation listener to knowladge nats that the event handled", async () => {
  const { orderCreationListener, data, msg } = await setup();

  await orderCreationListener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

test("The Ticket service will emit a TicketUpdate Event when the order created, to Inform other services with the update that just happened", async () => {
  const { orderCreationListener, data, msg } = await setup();

  await orderCreationListener.onMessage(data, msg);

  // get the ticket and check if it has reserved or not
  expect(natsServer.client.publish).toHaveBeenCalled();

  console.log((natsServer.client.publish as jest.Mock).mock.calls);
  const updatedData = JSON.parse(
    (natsServer.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(updatedData.id).toEqual(data.ticket.id);
  // Because the updated ticket the version should be increased
  expect(updatedData.version).toEqual(data.ticket.version + 1);
});

test("Kafka --- The ticket is reserved and the orderId found once the order created to the ticket", async () => {
  const { orderCreationListener1, data, msg, payload } = await setup();

  console.log(orderCreationListener1);
  await orderCreationListener1.onMessage(data, payload);

  // get the ticket and check if it has reserved or not
  const fetchedTicket = await Ticket.findById(data.ticket.id);
  console.log(fetchedTicket);
  // Expect its reserved because it has the orderId
  expect(fetchedTicket?.orderId).not.toBeNull();
  expect(fetchedTicket?.orderId?.toHexString()).toEqual(data.id);
  expect(fetchedTicket?.id).toEqual(data.ticket.id);
  expect(fetchedTicket?.version).toEqual(1);
});

test("Kafka --- ack the message in the order creation listener to knowladge nats that the event handled", async () => {
  const { orderCreationListener1, data, payload } = await setup();

  console.log(orderCreationListener1);
  // Initilaize consumer
  orderCreationListener1.listen();
  // Ensure the consumer is properly initialized
  if (!orderCreationListener1.consumer) {
    throw new Error("Consumer is not initialized");
  }

  const commitOffsetsSpy = jest.spyOn(
    orderCreationListener1.consumer,
    "commitOffsets"
  );

  await orderCreationListener1.onMessage(data, payload);

  expect(commitOffsetsSpy).toHaveBeenCalled();
});
