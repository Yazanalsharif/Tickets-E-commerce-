import { Publisher1 } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { PaymentCreatedEvent } from "@yalsharif/common";

export class PaymentCreationPublisher extends Publisher1<PaymentCreatedEvent> {
  topic: Subjects.PaymentCreated = Subjects.PaymentCreated;

  publish(data: PaymentCreatedEvent["data"]): Promise<void> {
    console.log("Payment Creation Publisher, Published an event", this.topic);
    return super.publish(data);
  }
}

const paymentCreationPublisher = new PaymentCreationPublisher();

export { paymentCreationPublisher };
