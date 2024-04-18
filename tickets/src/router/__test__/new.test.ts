import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { natsServer } from "../../events/Nats";

// {
//   title: string,
//   price: string
// }

test("Create new ticket end point is defined /api/tickets/", async () => {
  let response = await request(app).post("/api/tickets/").send({});

  expect(response.status).not.toEqual(404);
});

test("Retrun Error 401 user not authrorized if the user not authenticated", async () => {
  await request(app).post("/api/tickets/").send({}).expect(401);
});

test("not to return 401 if the user is authenticated", async () => {
  const session = global.fakeAuth();

  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session);

  expect(response.status).not.toEqual(401);
});

test("Returns error when the user enter invalid title", async () => {
  const session = global.fakeAuth();
  await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      price: 1,
    })
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
  expect(response.body.errors[0].message).toEqual("Title is required");
});

test("Returns error when the user enter invalid price", async () => {
  const session = global.fakeAuth();
  await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title: "sadfasdfsadf",
      price: -10,
    })
    .expect(400);

  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title: "sadfasdfsadf",
    })
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
  expect(response.body.errors[0].message).toEqual(
    "Price should be Greater than 0"
  );
});

test("Returns errors when the title and price not provided", async () => {
  const session = global.fakeAuth();
  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({})
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
  expect(response.body.errors[1].message).toBeDefined();
  expect(response.body.errors[0].message).toEqual("Title is required");
  expect(response.body.errors[1].message).toEqual(
    "Price should be Greater than 0"
  );
});

test("Tickets succussfully created and stored in the database", async () => {
  // Check if the ticket stored in the database after succussfuly cretated.
  const session = global.fakeAuth();
  let title = "NightMare Ticket";
  let price = 10;
  // send the request to the app
  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title,
      price,
    })
    .expect(201);

  let ticket = await Ticket.findById(response.body.ticket.id);

  expect(ticket).toBeDefined();

  expect(response.body.message).toBeDefined();
  expect(response.body.message).toEqual("Ok");
  expect(response.body.ticket.title).toEqual(title);
  expect(response.body.ticket.price).toEqual(price);
  expect(response.body.ticket.title).toEqual(ticket?.title);
});

test("The Event is published once the ticket has been created", async () => {
  const session = global.fakeAuth();
  let title = "NightMare Ticket";
  let price = 10;
  // send the request to the app
  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title,
      price,
    })
    .expect(201);

  expect(natsServer.client.publish).toHaveBeenCalled();
});
