import { EachMessagePayload } from "kafkajs";
import {
  Subjects,
  Listener1,
  ExpirationCompleted,
  OrderStatus,
} from "@yalsharif/common";
import { orderExpirationListenerQg } from "../utils/queueGroupName";
import { Order } from "../../models/Order";
import { orderCancelletionPublisher } from "../Publishers/OrderCancelletionPublisher";

export class OrderExpirationListener1 extends Listener1<ExpirationCompleted> {
  queueGroupName: string = orderExpirationListenerQg;
  topic: Subjects = Subjects.ExpirationCompleted;

  async onMessage(
    data: ExpirationCompleted["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.message.offset +
        "] Order Expired  / Order Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
      const order = await Order.findById(data.orderId).populate("ticket");

      if (!order) {
        throw new Error("The order Id does not exist");
      }

      order.status = OrderStatus.Cancelled;

      await order.save();

      // Publish a order cancelled event
      await orderCancelletionPublisher.publish({
        id: order.id,
        expiration: order.expiration.toISOString(),
        userId: order.userId.toHexString(),
        status: order.status,
        version: order.version,
        ticket: {
          id: order.ticket.id,
          price: order.ticket.price,
          title: order.ticket.title,
          version: order.ticket.version,
        },
      });

      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);
    } catch (err) {
      console.log("ERROR | Expiration Completed Listener | Order Service");
      console.log(err);
    }
  }
}
