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
    version: number;
  };
}

export interface ticketingUpdating extends Events {
  subject: Subjects.TicketUpdateing;
  data: {
    id: string;
    price: number;
    title: string;
    userId: string;
    version: number;
    orderId?: string;
  };
}

export interface OrderCreation extends Events {
  subject: Subjects.OrderCreation;
  data: {
    id: string;
    expiration: string;
    userId: string;
    status: string;
    version: number;
    ticket: {
      id: string;
      title: string;
      price: number;
      version: number;
    };
  };
}

export interface OrderCancelletion extends Events {
  subject: Subjects.OrderCancelletion;
  data: {
    id: string;
    expiration: string;
    userId: string;
    status: string;
    version: number;
    ticket: {
      id: string;
      title: string;
      price: number;
      version: number;
    };
  };
}


export interface ExpirationCompleted extends Events {
  subject: Subjects.ExpirationCompleted;
  data: {
    orderId: string;
    };
  };


 
export interface PaymentCreatedEvent extends Events {
  subject: Subjects.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}

