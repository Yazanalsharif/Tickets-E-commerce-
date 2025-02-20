import { OrderCancelletion, OrderStatus } from "@yalsharif/common";
import { EachMessagePayload } from "kafkajs";
import { Listener1, Subjects } from "@yalsharif/common";

import { orderCancelletionListenerPaymentSrvQg } from "../utils/queueGroupName";
import { Order } from "../../models/order";
// import { ticketingUpdatingPublisher1 } from "../publishers/TicketingUpdating1";

export class OrderCancelletionListener1 extends Listener1<OrderCancelletion> {
  queueGroupName: string = orderCancelletionListenerPaymentSrvQg;
  topic: Subjects = Subjects.OrderCancelletion;

  async onMessage(
    data: OrderCancelletion["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.partition +
        "] Order Cancelled / Payment Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
      const order = await Order.findOne({
        _id: data.id,
        version: data.version - 1,
      });

      if (!order) {
        throw new Error("Order not found");
      }

      order.set({ status: OrderStatus.Cancelled });
      await order.save();

      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);

      // consumer.commitOffsets([
      //   { topic, partition, offset: (parseInt(message.offset, 10) + 1).toString() }
      // ]);
      // Save the ticket
    } catch (err) {
      console.log("ERROR | OrderCancellation | Payment Service");
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
