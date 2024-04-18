import mongoose, { Types } from "mongoose";

// Interface describe the Tickates attributes for creating a use
interface TicketAttr {
  title: string;
  price: number;
  userId: string;
}

// Interface that describe the user document
// that the model has
interface TicketsDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  createdAt: Date;
}

interface TicketModel extends mongoose.Model<TicketsDoc> {
  build(ticket: TicketAttr): TicketsDoc;
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
    userId: {
      type: String,
      require: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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

ticketSchema.statics.build = (ticket: TicketAttr) => {
  return new Ticket(ticket);
};

let Ticket = mongoose.model<TicketsDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, TicketsDoc };
