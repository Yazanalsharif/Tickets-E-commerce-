import {
  Subjects,
  Listener,
  ExpirationCompleted,
  OrderStatus,
} from "@yalsharif/common";
import { orderListenerQueueGroupName } from "../utils/queueGroupName";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { OrderCancellPublisher } from "../Publishers/OrderCancelletion";

// This class will listen from the Expiration Service
export class ExpirationCompletedListener extends Listener<ExpirationCompleted> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
  queueGroupName: string = orderListenerQueueGroupName;

  async onMessage(data: { orderId: string }, msg: Message) {
    try {
      const order = await Order.findById(data.orderId);

      if (!order) {
        throw new Error("The order Id does not exist");
      }

      order.status = OrderStatus.Cancelled;

      await order.save();
      // Publish a order cancelled event
      new OrderCancellPublisher(this.client).publish({
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
    } catch (err) {
      console.log("ERROR | Expiration Completed Listener | Order Service");
      console.log(err);
    }
  }
}
