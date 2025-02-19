import { OrderCancelletion } from "@yalsharif/common";
import { Kafka, EachMessagePayload } from "kafkajs";
import { Listener1, Subjects } from "@yalsharif/common";

import { orderCancelletionListenerQg } from "../utils/queueGroupName";
import { Ticket } from "../../models/Ticket";
import { ticketingUpdatingPublisher1 } from "../publishers/TicketingUpdating1";

export class OrderCancelletionListener1 extends Listener1<OrderCancelletion> {
  queueGroupName: string = orderCancelletionListenerQg;
  topic: Subjects = Subjects.OrderCancelletion;

  async onMessage(
    data: OrderCancelletion["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.partition +
        "] Order Created / Ticket Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
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
      await ticketingUpdatingPublisher1.publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version,
        orderId: ticket.orderId?.toHexString(),
      });

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
      await ticket.save();
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Ticket Service");
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
