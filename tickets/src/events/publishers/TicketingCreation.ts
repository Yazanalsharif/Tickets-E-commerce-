import { Publisher } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
// Events schema
import { ticketingCreation } from "@yalsharif/common";

export class TicketingCreationPublisher extends Publisher<ticketingCreation> {
  subject = Subjects.TicketCreation;

  // // overriding the publish function to declare the accepted data type
  publish(data: ticketingCreation["data"]): Promise<void> {
    // Make sure that only the data schema will be send to the super function
    return super.publish(data);
  }
}
