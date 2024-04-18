import nats, { Message } from "node-nats-streaming";
import { getRandomValues, randomBytes } from "crypto";
import { TicketingCreation } from "./Events/TicketingCreationListener";
// provide the cluster id and the client id.
const stan = nats.connect("ticketing", randomBytes(5).toString("hex"), {
  url: "http://localhost:4222",
});

// Once connection done
stan.on("connect", async () => {
  console.log("connection from the listener");

  // when the connection is closed it will listen the this emitted event and execute the funciton before close the whole process
  stan.on("close", () => {
    console.log("nats connection closed");
    process.exit();
  });

  new TicketingCreation(stan).listen();
});
