import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

test("Return 401 not authorized if the user not the owner", async () => {
  const user1 = global.fakeAuth();
  const user2 = global.fakeAuth();

  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "Ticket",
    price: 29,
  }).save();
  // Create an order of user 1
  const response = await request(app)
    .post(`/api/orders`)
    .set("Cookie", user1)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${response.body.order.id}`)
    .send({})
    .set("Cookie", user2)
    .expect(401);
});

test("Return 401 not authorized if the user not authorized", async () => {
  await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .send({})
    .expect(401);
});

test("Return 404 if the order not exist or the order id not valid ", async () => {
  const user = global.fakeAuth();
  await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .send({})
    .set("Cookie", user)
    .expect(404);

  await request(app)
    .get(`/api/orders/a;sdjfsafjd`)
    .send({})
    .set("Cookie", user)
    .expect(400);
});
test("Succussfully Return The order if the order exist", async () => {
  const user = global.fakeAuth();

  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "Ticket",
    price: 29,
  }).save();
  // Create an order of user 1
  const response = await request(app)
    .post(`/api/orders`)
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${response.body.order.id}`)
    .send({})
    .set("Cookie", user)
    .expect(200);
});
