import mongoose, { Types } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// Interface describe the Tickates attributes for creating a use
interface TicketAttr {
  title: string;
  price: number;
  userId: mongoose.Types.ObjectId;
}

// Interface that describe the user document
// that the model has
interface TicketsDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  createdAt: Date;
  version: number;
  orderId?: mongoose.Types.ObjectId;
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
    orderId: {
      type: mongoose.Types.ObjectId,
      default: undefined,
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
// Config OCC : Optimistic concurrency control and change the version falg _v to version.
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);



// Build function to build the module
ticketSchema.statics.build = (ticket: TicketAttr) => {
  return new Ticket(ticket);
};

let Ticket = mongoose.model<TicketsDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, TicketsDoc };
