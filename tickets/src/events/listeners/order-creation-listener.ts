import { Message } from "node-nats-streaming";
import { Listener, OrderCancelletion } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
import { OrderCreation } from "@yalsharif/common";
import { OrderServiceListener } from "../utils/queueGroupName";
import { TicketingUpdating } from "../publishers/TicketingUpdating";
import { Ticket } from "../../models/Ticket";

export class OrderCreationListener extends Listener<OrderCreation> {
  readonly subject = Subjects.OrderCreation;
  queueGroupName = OrderServiceListener;

  // Choose the data
  // The data here is the created order
  async onMessage(data: OrderCreation["data"], msg: Message) {
    console.log(
      "Received a message [" +
        msg.getSequence() +
        "] Order Created / Ticket Service" +
        " " +
        process.env.CLIENT_ID
    );

    // Get the data and store the orderId in the ticket which it will use as way if the orderId exist the ticket is reserved

    try {
      console.log("From the orderCreation Listeners", data.ticket);
      // Get the ticket you want to reserve
      const ticket = await Ticket.findById(data.ticket.id);

      if (!ticket) {
        throw new Error(
          "Ticket Does not exist while listening the Order Service events || Ticket Service Listener"
        );
      }
      ticket.set({
        orderId: data.id,
      });

      // Save the ticket
      await ticket.save();

      // Publish an event to the order service to update the ticket version.
      new TicketingUpdating(this.client).publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version,
        orderId: ticket.orderId?.toHexString(),
      });

      // Ack the message
      msg.ack();
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Ticket Service");
      console.log(err);
    }
  }
}
