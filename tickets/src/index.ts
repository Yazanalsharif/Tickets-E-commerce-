import { app } from "./app";
import { dbConnection } from "../db/db";
import { natsServer } from "./events/Nats";
import crypto from "crypto";
import { Ticket } from "./models/Ticket";
import { OrderCancelletionListener } from "./events/listeners/order-cancellation-listener";
import { OrderCreationListener } from "./events/listeners/order-creation-listener";
import { OrderCreationListener1 } from "./events/listeners/order-createion-listener-kafka";
import { OrderCancelletionListener1 } from "./events/listeners/order-cancellation-listener-kafka";
import { ticketingCreationPublisher1 } from "./events/publishers/TicketingCreation1";
import { ticketingUpdatingPublisher1 } from "./events/publishers/TicketingUpdating1";

import { kafkaWrapper } from "./events/kafkaWrapper";
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

    if (!process.env.KAFKA_URL) {
      throw new Error(
        "The Kafka URL does not exist, Please add it to the pod env"
      );
    }

    try {
      // Connect Kafka
      await kafkaWrapper.connect(process.env.CLIENT_ID, [
        process.env.KAFKA_URL,
      ]);
      // // console.log(kafkaWrapper.client);
      const orderCancelletionListener = new OrderCancelletionListener1(
        kafkaWrapper.client
      );
      const orderCreationListener = new OrderCreationListener1(
        kafkaWrapper.client
      );

      // Database will be connected once the the application start to listen
      await dbConnection();
      // Connect the producers
      await ticketingCreationPublisher1.connect(kafkaWrapper.client);
      await ticketingUpdatingPublisher1.connect(kafkaWrapper.client);
      // Connect the listeners
      await orderCancelletionListener.listen();
      await orderCreationListener.listen();

      // new OrderCreationListener1(kafkaWrapper.client).listen();

      // await natsServer.connect(
      //   process.env.CLUSTER_ID,
      //   process.env.CLIENT_ID,
      //   process.env.NATS_URL
      // );

      // when the connection is closed it will listen the this emitted event and execute the funciton before close the whole process
      // natsServer.client.on("close", () => {
      //   console.log("Nats Connection Closed....");
      //   process.exit();
      // });

      // new OrderCreationListener(natsServer.client).listen();
      // new OrderCancelletionListener(natsServer.client).listen();

      // For termination the terminal
      process.on("SIGTERM", async () => {
        try {
          await orderCancelletionListener.disconnect();
          await orderCreationListener.disconnect();
          await ticketingUpdatingPublisher1.disconnect();
          await ticketingCreationPublisher1.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
      // For restart the terminal
      process.on("SIGINT", async () => {
        try {
          await orderCancelletionListener.disconnect();
          await orderCreationListener.disconnect();
          await ticketingUpdatingPublisher1.disconnect();
          await ticketingCreationPublisher1.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
      // for closing the terminal
      process.on("SIGHUP", async () => {
        try {
          await orderCancelletionListener.disconnect();
          await orderCreationListener.disconnect();
          await ticketingUpdatingPublisher1.disconnect();
          await ticketingCreationPublisher1.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  });
};

start();
