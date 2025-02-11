import { Subjects, Publisher, PaymentCreatedEvent } from "@yalsharif/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
