import { Subjects, OrderCreation, Publisher1 } from "@yalsharif/common";

class OrderCreationPublisher extends Publisher1<OrderCreation> {
  topic: Subjects.OrderCreation = Subjects.OrderCreation;

  publish(data: OrderCreation["data"]): Promise<void> {
    console.log("Order Creation Publisher, Published an event", this.topic);
    return super.publish(data);
  }
}

const orderCreationPublisher = new OrderCreationPublisher();

export { orderCreationPublisher };
