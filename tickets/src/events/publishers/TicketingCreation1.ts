import { Publisher1 } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { ticketingCreation } from "@yalsharif/common";

export class TicketingCreationPublisher1 extends Publisher1<ticketingCreation> {
  topic: Subjects.TicketCreation = Subjects.TicketCreation;

  publish(data: ticketingCreation["data"]): Promise<void> {
    console.log("Ticketing Creation Publisher, Published an event", this.topic);
    return super.publish(data);
  }
}

const ticketingCreationPublisher1 = new TicketingCreationPublisher1();

export { ticketingCreationPublisher1 };
