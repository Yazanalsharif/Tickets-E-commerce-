import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@yalsharif/common";
import { Message } from "node-nats-streaming";
import { orderListenerQueueGroupName } from "../utils/queueGroupName";
import { Order } from "../../models/Order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = orderListenerQueueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Completed,
    });
    await order.save();

    msg.ack();
  }
}
