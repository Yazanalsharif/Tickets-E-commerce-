import { Message } from "node-nats-streaming";
import { Listener, OrderCancelletion } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
import { OrderServiceListener } from "../utils/queueGroupName";
import { Ticket } from "../../models/Ticket";
import { TicketingUpdating } from "../publishers/TicketingUpdating";

export class OrderCancelletionListener extends Listener<OrderCancelletion> {
  readonly subject = Subjects.OrderCancelletion;
  queueGroupName = OrderServiceListener;

  // Choose the data
  async onMessage(data: OrderCancelletion["data"], msg: Message) {
    console.log(
      "Received a message [" +
        msg.getSequence() +
        "] Order Cancelletion / Ticket Service" +
        " " +
        process.env.CLIENT_ID
    );

    // Get the data and store the orderId in the ticket which it will use as way if the orderId exist the ticket is reserved
    try {
      // The error Came from here
      const ticket = await Ticket.findById(data.ticket.id);

      if (!ticket) {
        throw new Error(
          "Ticket Does not exist while listening the Order Service events || Ticket Service Listener"
        );
      }

      ticket.set({
        orderId: undefined,
      });

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

      msg.ack();
    } catch (err) {
      console.log("ERROR | OrderCancellation | Ticket Service");
      // console.log(err);
    }
  }
}
