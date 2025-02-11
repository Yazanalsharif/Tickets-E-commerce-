import { app } from "./app";
import { dbConnection } from "../db/db";
import { natsServer } from "./events/Nats";
import crypto from "crypto";
import { Ticket } from "./models/Ticket";
import { OrderCancelletionListener } from "./events/listeners/order-cancellation-listener";
import { OrderCreationListener } from "./events/listeners/order-creation-listener";
// Start Function
const start = async () => {
  let port = process.env.PORT || 3000;
  app.listen(port, async () => {
    console.log("Tickets Service run on port", port);

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY ITS NOT ADDED");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.NATS_URL) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.CLUSTER_ID) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.CLIENT_ID) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    try {
      await natsServer.connect(
        process.env.CLUSTER_ID,
        process.env.CLIENT_ID,
        process.env.NATS_URL
      );

      // when the connection is closed it will listen the this emitted event and execute the funciton before close the whole process
      natsServer.client.on("close", () => {
        console.log("Nats Connection Closed....");
        process.exit();
      });

      new OrderCreationListener(natsServer.client).listen();
      new OrderCancelletionListener(natsServer.client).listen();

      // For termination the terminal
      process.on("SIGTERM", () => natsServer.client.close());
      // For restart the terminal
      process.on("SIGINT", () => natsServer.client.close());
      // for closing the terminal
      process.on("SIGHUP", () => natsServer.client.close());

      // Database will be connected once the the application start to listen
      await dbConnection();
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  });
};

start();

