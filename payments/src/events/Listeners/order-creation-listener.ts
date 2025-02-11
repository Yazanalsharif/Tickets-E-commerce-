import { Message } from "node-nats-streaming";
import {
  Listener,
  Subjects,
  OrderCreation,
  OrderStatus,
} from "@yalsharif/common";
import { queueGroupName } from "../utils/queueGroupName";
import { Order } from "../../models/order";

export class OrderCreationListener extends Listener<OrderCreation> {
  readonly subject = Subjects.OrderCreation;
  queueGroupName = queueGroupName;

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
      const order = Order.build({
        id: data.id,
        price: data.ticket.price,
        status: OrderStatus.Created,
        userId: data.userId,
        version: data.version,
      });
      await order.save();

      msg.ack();
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Payment Service");
      console.log(err);
    }
  }
}
