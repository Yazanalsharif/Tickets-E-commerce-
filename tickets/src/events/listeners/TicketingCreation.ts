import { Message } from "node-nats-streaming";
import { Listener } from "@yalsharif/common";
import { Subjects } from "@yalsharif/common";
import { ticketingCreation } from "@yalsharif/common";

export class TicketingCreation extends Listener<ticketingCreation> {
  readonly subject = Subjects.TicketCreation;
  queueGroupName = "TicketingCreationQueueGroup";

  // Choose the data
  onMessage(data: ticketingCreation["data"], msg: Message): any {
    console.log("Received a message [" + msg.getSequence() + "] ", data);

    return data;
  }
}
