import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

test("return 401 if the user not authorized", async () => {
  let response = await request(app).get("/api/orders").send({}).expect(401);
  expect(response.body.errors[0].message).toBeDefined();
});
test("Return 200 with empty array if the user doesn't have any orders", async () => {
  let auth = global.fakeAuth();

  let response = await request(app)
    .get("/api/orders")
    .set("Cookie", auth)
    .send({})
    .expect(200);

  expect(response.body.orders).toBeDefined();
  expect(response.body.orders.length).toEqual(0);
});

test("Got only the orders that the user is owned", async () => {
  const userNumOne = global.fakeAuth();
  const userNumTwo = global.fakeAuth();

  // Create Three tickets for the user number one
  const ticketNumOne = await createTicket(1);
  const ticketNumTwo = await createTicket(2);
  const ticketNumThree = await createTicket(3);

  // Create Two Tickets to the user NumberTwo
  const ticketNumFour = await createTicket(4);
  const ticketNumFive = await createTicket(5);

  // Create Three orders for the user number 1
  const {
    body: { order: orderOne },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", userNumOne)
    .send({
      ticketId: ticketNumOne.id,
    })
    .expect(201);

  const {
    body: { order: orderTwo },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", userNumOne)
    .send({
      ticketId: ticketNumTwo.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", userNumOne)
    .send({
      ticketId: ticketNumThree.id,
    })
    .expect(201);
  // Create Two orders for the user number 2
  const {
    body: { order: orderFour },
  } = await request(app)
    .post("/api/orders")
    .set("Cookie", userNumTwo)
    .send({
      ticketId: ticketNumFour.id,
    })
    .expect(201);

  await request(app)
    .post("/api/orders")
    .set("Cookie", userNumTwo)
    .send({
      ticketId: ticketNumFive.id,
    })
    .expect(201);

  // Get the orders of the user Number 1, Expect 3 orders
  const {
    body: { orders: fetchedOrdersU1 },
  } = await request(app).get("/api/orders").set("Cookie", userNumOne).send({});

  // Get the orders of the user Number 2, Expect 2 orders
  const {
    body: { orders: fetchedOrdersU2 },
  } = await request(app).get("/api/orders").set("Cookie", userNumTwo).send({});

  expect(fetchedOrdersU1.length).toEqual(3);
  expect(fetchedOrdersU2.length).toEqual(2);
  expect(fetchedOrdersU1[0].id).toEqual(orderOne.id);
  expect(fetchedOrdersU1[1].id).toEqual(orderTwo.id);
  expect(fetchedOrdersU2[0].id).toEqual(orderFour.id);
});

// Helper function to create a new tickets
async function createTicket(num: number) {
  let ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: `Test Ticket ${num}`,
    price: 100,
  });

  await ticket.save();

  return ticket;
}
