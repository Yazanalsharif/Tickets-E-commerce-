import { OrderCreation } from "@yalsharif/common";
import { Kafka, EachMessagePayload } from "kafkajs";
import { Listener1, Subjects } from "@yalsharif/common";

import { orderCreationListenerQg } from "../utils/queueGroupName";
import { Ticket } from "../../models/Ticket";
import { ticketingUpdatingPublisher1 } from "../publishers/TicketingUpdating1";

export class OrderCreationListener1 extends Listener1<OrderCreation> {
  queueGroupName: string = orderCreationListenerQg;
  topic: Subjects = Subjects.OrderCreation;

  async onMessage(
    data: OrderCreation["data"],
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

      // Publish an event to the order service to update the ticket version.
      // Publish an event to the order service to update the ticket version.
      // // const ticketUpdatePublisher = new TicketingUpdating1();
      // // await ticketUpdatePublisher.connect();
      await ticket.save();
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
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Ticket Service");
      console.log(err);
    }
  }
}
