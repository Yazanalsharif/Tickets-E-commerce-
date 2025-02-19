import { Kafka, EachMessagePayload } from "kafkajs";
import { Subjects, Listener1, ticketingUpdating } from "@yalsharif/common";
import { ticketUpdatingListenerQg } from "../utils/queueGroupName";
// import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

export class TicketUpdateListener1 extends Listener1<ticketingUpdating> {
  queueGroupName: string = ticketUpdatingListenerQg;
  topic: Subjects = Subjects.TicketUpdateing;

  async onMessage(
    data: ticketingUpdating["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.message.offset +
        "] Ticket Updated / Order Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
      let ticket = await Ticket.findByVersion(data.id, data.version);

      ticket.set({
        title: data.title,
        price: data.price,
        orderId: data.orderId,
      });

      await ticket.save();

      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);
    } catch (err) {
      console.log("ERROR | TicketUpdating | Order Service");
      console.log(err);
    }
  }
}
