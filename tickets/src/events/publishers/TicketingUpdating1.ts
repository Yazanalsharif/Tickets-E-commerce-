import { Publisher1 } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { ticketingUpdating } from "@yalsharif/common";

class TicketingUpdatingPublisher1 extends Publisher1<ticketingUpdating> {
  topic: Subjects.TicketUpdateing = Subjects.TicketUpdateing;

  publish(data: ticketingUpdating["data"]): Promise<void> {
    console.log("Ticketing Updating Publisher, Published an event", this.topic);
    return super.publish(data);
  }
}

const ticketingUpdatingPublisher1 = new TicketingUpdatingPublisher1();

export { ticketingUpdatingPublisher1 };
