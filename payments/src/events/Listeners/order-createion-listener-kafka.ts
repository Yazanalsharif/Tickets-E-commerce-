import { OrderCreation, OrderStatus } from "@yalsharif/common";
import { EachMessagePayload } from "kafkajs";
import { Listener1, Subjects } from "@yalsharif/common";

import { orderCreationListenerPaymentSrvQg } from "../utils/queueGroupName";
import { Order } from "../../models/order";

export class OrderCreationListener1 extends Listener1<OrderCreation> {
  queueGroupName: string = orderCreationListenerPaymentSrvQg;
  topic: Subjects = Subjects.OrderCreation;

  async onMessage(
    data: OrderCreation["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.partition +
        "] Order Creation / Payment Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
      const order = Order.build({
        id: data.id,
        price: data.ticket.price,
        status: OrderStatus.Created,
        userId: data.userId,
        version: data.version,
      });
      await order.save();
      const orders = await Order.find({});
      console.log("Num of orders", orders.length);
      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);
    } catch (err) {
      console.log("ERROR | OrderCreation | Payment Service");
      console.log(err);
    }
  }
}

// try {
//   // The error Came from here
//   const ticket = await Ticket.findById(data.ticket.id);

//   if (!ticket) {
//     throw new Error(
//       "Ticket Does not exist while listening the Order Service events || Ticket Service Listener"
//     );
//   }

//   ticket.set({
//     orderId: undefined,
//   });

//   await ticket.save();

//   // Publish an event to the order service to update the ticket version.
//   new TicketingUpdating(this.client).publish({
//     id: ticket.id,
//     price: ticket.price,
//     title: ticket.title,
//     userId: ticket.userId,
//     version: ticket.version,
//     orderId: ticket.orderId?.toHexString(),
//   });

//   msg.ack();
// } catch (err) {
//   console.log("ERROR | OrderCancellation | Ticket Service");
//   // console.log(err);
// }
