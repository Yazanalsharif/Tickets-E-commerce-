import request from "supertest";
import { Order } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsServer } from "../../events/Nats";

// Test if the user is authorized
test("Retrun Error 403 if the user is not authorized", async () => {
  await request(app)
    .post("/api/orders")
    .send({
      ticketId: "wrongTicketId",
    })
    .expect(401);
});

// Return Error if the ticketId is not valid or exist in the database
test("Return Error 404 if the ticket is not valid or does not exist", async () => {
  const auth = global.fakeAuth();

  const response = await request(app)
    .post("/api/orders")
    .send({
      ticketId: new mongoose.Types.ObjectId(),
    })
    .set("Cookie", auth)
    .expect(404);
});
// Return Error if the ticket is reserved
// Return Error if the ticketId is not valid or exist in the database
test("Return Error 404 if the ticket is not valid or does not exist", async () => {
  const auth = global.fakeAuth();

  await request(app)
    .post("/api/orders")
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString(),
    })
    .set("Cookie", auth)
    .expect(404);

  // Bad Request the ticketId has not been provided
  await request(app)
    .post("/api/orders")
    .send({})
    .set("Cookie", auth)
    .expect(400);

  let response = await request(app)
    .post("/api/orders")
    .send({
      ticketId: "as;djfas;kjdf",
    })
    .set("Cookie", auth)
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
});

// Succusfully resleved the ticket and create Order
it("The Ticket should be reserved once the order has been created", async () => {
  // Create a ticket.
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "Ticket Test 1",
    price: 20,
  });

  // Ticket saved in the databases
  await ticket.save();

  // user auth
  const auth = global.fakeAuth();
  //create the ticket
  const response = await request(app)
    .post("/api/orders")
    .send({
      ticketId: ticket.id,
    })
    .set("Cookie", auth)
    .expect(201);

  // Expect that response return the order
  expect(response.body.order).toBeDefined();
  expect(response.body.order.ticket).toBeDefined();
  expect(response.body.order.ticket.id).toBeDefined();
  expect(response.body.order.ticket.id).toEqual(ticket.id);

  // Expect that the order is created in the databse
  let fetchOrder = await Order.findById(response.body.order.id).populate(
    "ticket"
  );

  expect(fetchOrder).toBeDefined();
  expect(fetchOrder?.ticket.id).toEqual(ticket.id);
});
// Test if the createOrder event has been published
it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.fakeAuth())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsServer.client.publish).toHaveBeenCalled();
});
