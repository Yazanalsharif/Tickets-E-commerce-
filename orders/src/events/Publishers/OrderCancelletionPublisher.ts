import { Publisher1 } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { OrderCancelletion } from "@yalsharif/common";

class OrderCancelletionPublisher extends Publisher1<OrderCancelletion> {
  topic: Subjects.OrderCancelletion = Subjects.OrderCancelletion;

  publish(data: OrderCancelletion["data"]): Promise<void> {
    console.log("Order Cancelletion Publisher, Published an event", this.topic);
    return super.publish(data);
  }
}

const orderCancelletionPublisher = new OrderCancelletionPublisher();

export { orderCancelletionPublisher };
