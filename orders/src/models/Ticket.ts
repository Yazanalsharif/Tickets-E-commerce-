import mongoose, { Types } from "mongoose";
import { Order } from "./Order";
import { OrderStatus } from "@yalsharif/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// Interface describe the Tickates attributes for creating a use
interface TicketAttr {
  id: mongoose.Types.ObjectId;
  title: string;
  price: number;
}

// Interface that describe the user document
// that the model has
interface TicketsDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketsDoc> {
  build(ticket: TicketAttr): TicketsDoc;
  findByVersion(id: string, version: number): Promise<TicketsDoc>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
  },
  {
    toJSON: {
      transform(doc, ref, options) {
        ref.id = ref._id;
        delete ref._id;
        delete ref.__v;
      },
    },
  }
);
// Implement occ using version
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticket: TicketAttr) => {
  return new Ticket({
    _id: ticket.id,
    title: ticket.title,
    price: ticket.price,
  });
};

ticketSchema.statics.findByVersion = async (id: string, version: number) => {
  const ticket = await Ticket.findOne({
    _id: id,
    version: version - 1,
  });

  if (!ticket) {
    throw new Error("Concurrency Issue");
  }

  return ticket;
};

ticketSchema.methods.isReserved = async function () {
  // Check if the ticket not reserved.
  const order = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Completed,
        OrderStatus.AwaitingPayment,
        OrderStatus.Created,
      ],
    },
  }).populate("ticket");

  return !!order;
};
let Ticket = mongoose.model<TicketsDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, TicketsDoc };
