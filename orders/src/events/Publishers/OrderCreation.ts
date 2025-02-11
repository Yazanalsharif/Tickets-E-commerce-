import { Publisher, Subjects, OrderCreation } from "@yalsharif/common";

export class OrderCreationPublisher extends Publisher<OrderCreation> {
  subject = Subjects.OrderCreation;
}
