import request from "supertest";
import { app } from "../../app";
import { Ticket, TicketsDoc } from "../../models/Ticket";
import mongoose, { Types } from "mongoose";

test("Return empty array if there are no tickets", async () => {
  let response = await request(app).get("/api/tickets/").send({}).expect(200);

  expect(response.body.message).toBeDefined();
  expect(response.body.message).toEqual("Ok");
  expect(response.body.tickets).toBeDefined();
  expect(response.body.tickets.length).toEqual(0);
});

test("Get all tickets succusfully", async () => {
  await createTickets(3);

  let response = await request(app).get("/api/tickets/").send({}).expect(200);

  expect(response.body.message).toBeDefined();
  expect(response.body.message).toEqual("Ok");
  expect(response.body.tickets).toBeDefined();
  expect(response.body.tickets.length).toEqual(3);
});

test("Return 404 if the user looking to ticket doesn't exist", async () => {
  // tickets dosn't exist
  let response = await request(app)
    .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .send({})
    .expect(404);

  expect(response.body.ticket).toBeUndefined();
});

test("Return 404 if the user looking to ticket with invalid Id (ObjectId Required)", async () => {
  // tickets dosn't exist
  let response = await request(app)
    .get(`/api/tickets/sla;fjsladjf;`)
    .send({})
    .expect(404);

  expect(response.body.ticket).toBeUndefined();
});

test("Get ticket by the ticketId Succusfully", async () => {
  let tickets = await createTickets(1);

  let response = await request(app)
    .get(`/api/tickets/${tickets[0].id}`)
    .send({})
    .expect(200);

  expect(response.body.ticket).toBeDefined();
  expect(response.body.ticket.id).toEqual(tickets[0].id);
  expect(response.body.ticket.title).toEqual(tickets[0].title);
});

// Helper function to create tickets
async function createTickets(ticketsNumber: number): Promise<TicketsDoc[]> {
  let tickets: TicketsDoc[] = [];
  try {
    for (let i = 0; i < ticketsNumber; i++) {
      let ticket = Ticket.build({
        title: `Ticket Number ${i + 1}`,
        price: 20 * (i + 1),
        userId: new mongoose.Types.ObjectId().toHexString(),
      });

      await ticket.save();
      tickets.push(ticket);
    }
  } catch (err) {
    console.log(err);
  }
  return tickets;
}
export { createTickets };
