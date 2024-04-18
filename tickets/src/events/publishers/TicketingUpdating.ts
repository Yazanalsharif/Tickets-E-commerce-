import { Publisher } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { ticketingUpdating } from "@yalsharif/common";

export class TicketingUpdating extends Publisher<ticketingUpdating> {
  subject = Subjects.TicketUpdateing;

  // overriding the publish function to declare the accepted data type
  publish(data: ticketingUpdating["data"]): Promise<void> {
    // Make sure that only the data schema will be send to the super function

    return super.publish(data);
  }
}
