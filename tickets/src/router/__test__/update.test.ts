import request from "supertest";
import { app } from "../../app";
import { Ticket, TicketsDoc } from "../../models/Ticket";
import mongoose, { Types } from "mongoose";
import { createTickets } from "./getTickets.test";
import { natsServer } from "../../events/Nats";

test("Return 401 if the user not authorized", async () => {
  // The object id and the invalid data not important because it test the auth first
  await request(app)
    .put("/api/tickets/;ajsdf;asd")
    .send({
      title: "Number update",
      price: 100,
    })
    .expect(401);
});

test("Return 404 if the ticket doesn't exit", async () => {
  const session = global.fakeAuth();

  let response = await request(app)
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .set("Cookie", session)
    .send({
      title: "Number update",
      price: 100,
    })
    .expect(404);

  expect(response.body.errors[0].message).toBeDefined();
});

test("Return 401 if the user not the owner", async () => {
  let tickets = await createTickets(1);
  const session = global.fakeAuth();

  let response = await request(app)
    .put(`/api/tickets/${tickets[0].id}`)
    .set("Cookie", session)
    .send({
      title: "Number update",
      price: 100,
    })
    .expect(401);
});

test("return status code 400 if the invalid data has been passed", async () => {
  let tickets = await createTickets(1);
  const session = global.fakeAuth();
  let title = "Ticket Number 0";
  let price = 10;
  // create ticket request
  // send the request to the app
  const createTicketResponse = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title,
      price,
    })
    .expect(201);

  let ticketId = createTicketResponse.body.ticket.id;

  // You can expect 1 error messages
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", session)
    .send({
      price: 0,
    })
    .expect(400);

  // you can expect 2 errors messages exist
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", session)
    .send({
      title: "",
    })
    .expect(400);

  // you can expect 2 errors messages exist
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", session)
    .send({
      title: " ",
      price: 20,
    })
    .expect(400);

  // you can expect 2 errors messages exist
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", session)
    .send({})
    .expect(400);
});

// Tomorrow
test("The ticket should updated if the valid data passed and the owned is updating it", async () => {
  let session = global.fakeAuth();

  let title = "Ticket updated 0";
  let price = 90;

  // create a new ticket
  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title: "Ticket Number",
      price: 10,
    })
    .expect(201);

  let updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.ticket.id}`)
    .set("Cookie", session)
    .send({
      title,
      price,
    })
    .expect(200);

  expect(updatedResponse.body.ticket.title).toEqual(title);
  expect(updatedResponse.body.ticket.price).toEqual(price);

  let updatedTicket = await Ticket.findById(response.body.ticket.id);

  expect(updatedTicket?.title).toEqual(title);
  expect(updatedTicket?.price).toEqual(price);
});

test("The Event is published once the ticket has been updated", async () => {
  let session = global.fakeAuth();

  let title = "Ticket updated 0";
  let price = 90;

  // create a new ticket
  let response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", session)
    .send({
      title: "Ticket Number",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.ticket.id}`)
    .set("Cookie", session)
    .send({
      title,
      price,
    })
    .expect(200);

  // called twice one for creation and secound for updating
  expect(natsServer.client.publish).toHaveBeenCalledTimes(2);
});
