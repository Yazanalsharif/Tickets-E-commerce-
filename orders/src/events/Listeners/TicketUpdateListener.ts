import {
  Subjects,
  Listener,
  ticketingCreation,
  ticketingUpdating,
} from "@yalsharif/common";
import { orderListenerQueueGroupName } from "../utils/queueGroupName";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import mongoose, { version } from "mongoose";

export class TicketUpdateListener extends Listener<ticketingUpdating> {
  readonly subject = Subjects.TicketUpdateing;

  queueGroupName = orderListenerQueueGroupName;

  async onMessage(data: ticketingUpdating["data"], msg: Message) {
    console.log(
      "Received a message [" +
        msg.getSequence() +
        "] TicketUpdated / Order Service" +
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

      msg.ack();
    } catch (err) {
      console.log("ERROR | Ticket Update Listener | Order Service");
      console.log(err);
    }
  }
}
