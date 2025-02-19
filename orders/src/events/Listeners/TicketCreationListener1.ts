import { Kafka, EachMessagePayload } from "kafkajs";
import { Subjects, Listener1, ticketingCreation } from "@yalsharif/common";
import { ticketCreationListenerQg } from "../utils/queueGroupName";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

export class TicketCreationListener1 extends Listener1<ticketingCreation> {
  queueGroupName: string = ticketCreationListenerQg;
  topic: Subjects = Subjects.TicketCreation;

  async onMessage(
    data: ticketingCreation["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.message.offset +
        "] Ticket Created / Order Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
      // Simple implementation for Queue Group
      const { title, price, id } = data;

      let ticket = Ticket.build({
        id: new mongoose.Types.ObjectId(id),
        title,
        price,
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
      console.log("ERROR | Ticket Creation Listener | Order Service");
      console.log(err);
    }
  }
}
