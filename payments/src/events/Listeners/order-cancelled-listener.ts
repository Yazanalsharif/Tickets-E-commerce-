import {
  OrderCancelletion,
  Subjects,
  Listener,
  OrderStatus,
} from "@yalsharif/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../utils/queueGroupName";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelletion> {
  subject: Subjects.OrderCancelletion = Subjects.OrderCancelletion;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelletion["data"], msg: Message) {
    // Find the correct version of the order which its minus 1 of the main order version
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
