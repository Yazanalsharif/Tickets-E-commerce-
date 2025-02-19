import { Kafka, EachMessagePayload } from "kafkajs";
import {
  Subjects,
  Listener1,
  PaymentCreatedEvent,
  OrderStatus,
} from "@yalsharif/common";
import { paymentCreationListenerQg } from "../utils/queueGroupName";
import { Order } from "../../models/Order";

export class PaymentCreationListener1 extends Listener1<PaymentCreatedEvent> {
  queueGroupName: string = paymentCreationListenerQg;
  topic: Subjects = Subjects.PaymentCreated;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.message.offset +
        "] Payment Created / Order Service " +
        " " +
        process.env.CLIENT_ID
    );

    try {
      // Simple implementation for Queue Group
      const order = await Order.findById(data.orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      order.set({
        status: OrderStatus.Completed,
      });
      await order.save();

      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);
    } catch (err) {
      console.log("ERROR | Payment Creation | Order Service");
      console.log(err);
    }
  }
}
