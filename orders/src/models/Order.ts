import mongoose from "mongoose";
import { TicketsDoc } from "./Ticket";
import { OrderStatus } from "@yalsharif/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttr {
  userId: mongoose.Types.ObjectId;
  status: string;
  expiration: Date;
  ticket: TicketsDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  status: string;
  expiration: Date;
  createdAt: Date;
  ticket: TicketsDoc;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(order: OrderAttr): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    status: {
      type: String,
      reuqire: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiration: {
      type: Date,
      require: true,
    },
    ticket: {
      type: mongoose.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ref, options) {
        ref.id = doc._id;
        delete ref._id;
        delete ref.__v;
      },
    },
  }
);
// Add occ to the order schema
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (order: OrderAttr) => {
  return new Order(order);
};

let Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderDoc };
