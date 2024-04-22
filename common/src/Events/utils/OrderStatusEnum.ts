export enum OrderStatus {
  // The order is created
  Created = "created",
  // The order is cancelled and the ticket is available
  Cancelled = "cancelled",
  // The ticket has succusfully reserved the ticket.
  AwaitingPayment = "awaiting:payment",
  // The ticket has been completed.
  Completed = "completed",
}
