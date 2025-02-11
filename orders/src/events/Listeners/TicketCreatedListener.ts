import { Subjects, Listener, ticketingCreation } from "@yalsharif/common";
import { orderListenerQueueGroupName } from "../utils/queueGroupName";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

export class TicketCreatedListener extends Listener<ticketingCreation> {
  // Determine the subject for this listener
  readonly subject = Subjects.TicketCreation;

  // Determine Queue Group Name
  queueGroupName = orderListenerQueueGroupName;

  // Function onMassage to hande the events
  async onMessage(
    data: { id: string; price: number; title: string; userId: string },
    msg: Message
  ) {
    try {
      console.log(
        "Received a message [" +
          msg.getSequence() +
          "] TicketCreated / OrderService " +
          process.env.CLIENT_ID
      );

      // Simple implementation for Queue Group
      const { title, price, id } = data;

      let ticket = Ticket.build({
        id: new mongoose.Types.ObjectId(id),
        title,
        price,
      });
      await ticket.save();

      msg.ack();
    } catch (err) {
      console.log("ERROR | Ticket Created Listener | Order Service");
      console.log(err);
    }
  }
}
