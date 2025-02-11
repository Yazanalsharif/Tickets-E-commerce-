import { Ticket } from "../Ticket";
import mongoose, { version } from "mongoose";
test("Implemetation of Optimistic concurrency control", async () => {
  // Create an new record to the database
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId(),
    title: "Test Ticket 1",
    price: 10,
  });
  await ticket.save();
  // Fetch the ticket instance twice
  const firstFetch = await Ticket.findById(ticket.id);
  const secoundFetch = await Ticket.findById(ticket.id);
  // update the tickets separately document

  firstFetch!.set("title", "Test Ticket 2");
  secoundFetch!.set("title", "Test Ticket 3");
  // Save the first fetched and expect success
  await firstFetch?.save();
  expect(firstFetch?.version).toEqual(1);
  // The ticket updated succussfully
  expect(firstFetch?.title).toEqual("Test Ticket 2");
  // Save the secound fetched and expect the error

  try {
    await secoundFetch!.save();
  } catch (err) {
    console.log("SecoundFetch thrown an error as expected");
    return;
    // expect(secoundFetch?.version).toEqual(0);
    // expect(secoundFetch?.title).toEqual("Test Ticket 3");
  }

  throw new Error(
    "Should not reach to this point, Because the secoundFetch should throw an error to make sure the occ working fine."
  );
});

test("Test the increment version when the instance saved ", async () => {
  // create a new record in the databse
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId(),
    title: "Test Ticket 1",
    price: 10,
  });
  await ticket.save();
  // update it and save it several time with expecting the increment each time
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  expect(ticket.version).not.toEqual(1);
  console.log(ticket.version);

  const updatedTicket = await Ticket.findOneAndUpdate(
    {
      _id: ticket.id,
      version: ticket.version,
    },
    {
      title: "Test",
    },
    {
      returnDocument: "after",
    }
  );
  await updatedTicket?.save();
});
