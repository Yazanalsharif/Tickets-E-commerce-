import { Events } from "../Listener";
import { Subjects } from "./subjects";
// The event interface includes the event name and the event data type
export interface ticketingCreation extends Events {
  subject: Subjects.TicketCreation;
  data: {
    id: string;
    price: number;
    title: string;
    userId: string;
  };
}

export interface ticketingUpdating extends Events {
  subject: Subjects.TicketUpdateing;
  data: {
    id: string;
    price: number;
    title: string;
    userId: string;
  };
}
