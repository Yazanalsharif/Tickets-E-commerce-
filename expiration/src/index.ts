import { app } from "./app";
import { natsServer } from "./events/Nats";
import { OrderCreationListener } from "./events/Listeners//order-created-listener";

import crypto from "crypto";

// Start Function
const start = async () => {
  let port = process.env.PORT || 3000;
  app.listen(port, async () => {
    console.log("Expiration Service run on internal port", port);

    if (!process.env.NATS_URL) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.CLUSTER_ID) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.CLIENT_ID) {
      throw new Error("The Mongodb uri for the ticketing server not exist");
    }

    if (!process.env.REDIS_URL) {
      throw new Error("The Redis Uri should be provided to save the system");
    }

    try {
      // Added the client instance after connection
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

      // // For termination the terminal
      process.on("SIGTERM", () => natsServer.client.close());
      // // For restart the terminal
      process.on("SIGINT", () => natsServer.client.close());
      // // for closing the terminal
      process.on("SIGHUP", () => natsServer.client.close());

      // Database will be connected once the the application start to listen
    } catch (err) {
      console.log("Here are the error");
      // console.log(err);
      process.exit(1);
    }
  });
};

start();
