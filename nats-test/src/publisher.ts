import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketingCreationPublisher } from "./Events/TicketingCreationPublisher";

// provide the cluster id and the client id.
const stan = nats.connect("ticketing", "TestHere");

stan.on("connect", async () => {
  console.log("connection from the publisher");

  let data = {
    id: "safd",
    price: 5,
    title: "Hello",
    userId: "dl;ajfds",
  };

  let publisher = new TicketingCreationPublisher(stan);
  try {
    await publisher.publish(data);
  } catch (err) {
    console.log("Publish is failed");
    console.log(err);
  }
});
