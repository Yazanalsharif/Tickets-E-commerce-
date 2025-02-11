import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { natsServer } from "../../events/Nats";
import mongoose from "mongoose";

// Return it soon
test("Return 200 with empty array if the user doesn't have any orders", async () => {});

it("emits a order cancelled event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const user = global.fakeAuth();
  // make a request to create an order
  const {
    body: { order },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .put(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsServer.client.publish).toHaveBeenCalled();
});
