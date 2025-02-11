import { app } from "./app";
import { dbConnection } from "../db/db";
import { natsWrapper } from "./events/Nats";
import { OrderCancelledListener } from "./events/Listeners/order-cancelled-listener";
import { OrderCreationListener } from "./events/Listeners/order-creation-listener";
import crypto from "crypto";

// Start Function
const start = async () => {
  let port = process.env.PORT || 3000;
  app.listen(port, async () => {
    console.log("payments Service run on port", port);

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY ITS NOT ADDED");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("The Mongodb uri for the payments server not exist");
    }

    if (!process.env.NATS_URL) {
      throw new Error("The Mongodb uri for the payments server not exist");
    }

    if (!process.env.CLUSTER_ID) {
      throw new Error("The Mongodb uri for the payments server not exist");
    }

    if (!process.env.CLIENT_ID) {
      throw new Error("The Mongodb uri for the payments server not exist");
    }

    try {
      await natsWrapper.connect(
        process.env.CLUSTER_ID,
        process.env.CLIENT_ID,
        process.env.NATS_URL
      );

      // when the connection is closed it will listen the this emitted event and execute the funciton before close the whole process
      natsWrapper.client.on("close", () => {
        console.log("Nats Connection Closed....");
        process.exit();
      });

      // // For termination the terminal
      process.on("SIGTERM", () => natsWrapper.client.close());
      // // For restart the terminal
      process.on("SIGINT", () => natsWrapper.client.close());
      // // for closing the terminal
      process.on("SIGHUP", () => natsWrapper.client.close());

      new OrderCreationListener(natsWrapper.client).listen();
      new OrderCancelledListener(natsWrapper.client).listen();

      // Database will be connected once the the application start to listen
      await dbConnection();
    } catch (err) {
      console.log("Here are the error");
      // console.log(err);
      process.exit(1);
    }
  });
};

start();
