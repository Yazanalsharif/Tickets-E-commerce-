import { app } from "./app";
import { natsServer } from "./events/Nats";
import { OrderCreationListener1 } from "./events/Listeners/OrderCreationListener";
import { expirationCompletedPublisher } from "./events/Publishers/ExpirationCompletedPublisher";
import { kafkaWrapper } from "./events/kafkaWrapper";

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

    if (!process.env.KAFKA_URL) {
      throw new Error(
        "The Kafka URL does not exist, Please add it to the pod env"
      );
    }

    try {
      kafkaWrapper.connect(process.env.CLIENT_ID, [process.env.KAFKA_URL]);
      // // console.log(kafkaWrapper.client);

      const orderCreationListener = new OrderCreationListener1(
        kafkaWrapper.client
      );

      await expirationCompletedPublisher.connect(kafkaWrapper.client);
      await orderCreationListener.listen();
      // Added the client instance after connection
      // await natsServer.connect(
      //   process.env.CLUSTER_ID,
      //   process.env.CLIENT_ID,
      //   process.env.NATS_URL
      // );
      // // when the connection is closed it will listen the this emitted event and execute the funciton before close the whole process
      // natsServer.client.on("close", () => {
      //   console.log("Nats Connection Closed....");
      //   process.exit();
      // });
      // new OrderCreationListener(natsServer.client).listen();
      // // // For termination the terminal
      // process.on("SIGTERM", () => natsServer.client.close());
      // // // For restart the terminal
      // process.on("SIGINT", () => natsServer.client.close());
      // // // for closing the terminal
      // process.on("SIGHUP", () => natsServer.client.close());
      // Database will be connected once the the application start to listen
    } catch (err) {
      console.log("Here are the error");
      // console.log(err);
      process.exit(1);
    }
  });
};

start();
