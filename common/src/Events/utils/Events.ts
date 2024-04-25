import { Events } from "../Listener";
import { OrderStatus } from "./OrderStatusEnum";
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

export interface OrderCreation extends Events {
  subject: Subjects.OrderCreation;
  data: {
    id: string;
    expiration: string;
    userId: string;
    status: string;
    ticket: string;
  };
}

export interface OrderCancelletion extends Events {
  subject: Subjects.OrderCancelletion;
  data: {
    id: string;
    expiration: string;
    userId: string;
    status: string;
    ticket: string;
  };
}

