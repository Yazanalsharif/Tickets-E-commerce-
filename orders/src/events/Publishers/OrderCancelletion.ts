import { Publisher, Subjects, OrderCancelletion } from "@yalsharif/common";

export class OrderCancellPublisher extends Publisher<OrderCancelletion> {
  subject = Subjects.OrderCancelletion;
}
