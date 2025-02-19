import { app } from "./app";
import { dbConnection } from "../db/db";
import { natsServer } from "./events/Nats";
import { TicketCreatedListener } from "./events/Listeners/TicketCreatedListener";
// import { TicketUpdateListener } from "./events/Listeners/TicketUpdateListener";
import { ExpirationCompletedListener } from "./events/Listeners/OrderExpirationListener";
import { PaymentCreatedListener } from "./events/Listeners/PaymentCreatedListenere";
import { TicketCreationListener1 } from "./events/Listeners/TicketCreationListener1";
import { TicketUpdateListener1 } from "./events/Listeners/TicketUpdateListener1";
import { OrderExpirationListener1 } from "./events/Listeners/OrderExpirationListener1";
import { PaymentCreationListener1 } from "./events/Listeners/PaymentCreationListener1";
import { kafkaWrapper } from "./events/kafkaWrapper";
import crypto from "crypto";
import { Ticket } from "./models/Ticket";
import { orderCancelletionPublisher } from "./events/Publishers/OrderCancelletionPublisher";
import { orderCreationPublisher } from "./events/Publishers/OrderCreationPublisher";

// Start Function
const start = async () => {
  let port = process.env.PORT || 3000;
  app.listen(port, async () => {
    console.log("Order Service run on port", port);

    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY ITS NOT ADDED");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("The Mongodb uri for the Order server not exist");
    }

    if (!process.env.NATS_URL) {
      throw new Error("The Mongodb uri for the Order server not exist");
    }

    if (!process.env.CLUSTER_ID) {
      throw new Error("The Mongodb uri for the Order server not exist");
    }

    if (!process.env.CLIENT_ID) {
      throw new Error("The Mongodb uri for the Order server not exist");
    }

    if (!process.env.KAFKA_URL) {
      throw new Error("The Kafka Url for the Order server not exist");
    }

    try {
      console.log(process.env.CLIENT_ID);
      // Database will be connected once the the application start to listen
      await dbConnection();
      kafkaWrapper.connect(process.env.CLIENT_ID, [process.env.KAFKA_URL]);
      // // Connect listeners
      const ticketCreationListener = new TicketCreationListener1(
        kafkaWrapper.client
      );
      const ticketUpdateListener = new TicketUpdateListener1(
        kafkaWrapper.client
      );
      const orderExpirationListener = new OrderExpirationListener1(
        kafkaWrapper.client
      );

      const paymentCreationListener = new PaymentCreationListener1(
        kafkaWrapper.client
      );

      // // Connect Listeners
      await ticketCreationListener.listen();
      await ticketUpdateListener.listen();
      await orderExpirationListener.listen();
      await paymentCreationListener.listen();
      // Connect the producers
      await orderCancelletionPublisher.connect(kafkaWrapper.client);
      await orderCreationPublisher.connect(kafkaWrapper.client);
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

      // new TicketCreatedListener(natsServer.client).listen();
      // new TicketUpdateListener(natsServer.client).listen();
      // new ExpirationCompletedListener(natsServer.client).listen();
      // new PaymentCreatedListener(natsServer.client).listen();
      // // // For termination the terminal
      // process.on("SIGTERM", () => natsServer.client.close());
      // // // For restart the terminal
      // process.on("SIGINT", () => natsServer.client.close());
      // // // for closing the terminal
      // process.on("SIGHUP", () => natsServer.client.close());
      // For termination the terminal
      process.on("SIGTERM", async () => {
        try {
          await ticketCreationListener.disconnect();
          await ticketUpdateListener.disconnect();
          await orderExpirationListener.disconnect();
          await paymentCreationListener.disconnect();

          await orderCancelletionPublisher.disconnect();
          await orderCreationPublisher.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
      // For restart the terminal
      process.on("SIGINT", async () => {
        try {
          await ticketCreationListener.disconnect();
          await ticketUpdateListener.disconnect();
          await orderExpirationListener.disconnect();
          await paymentCreationListener.disconnect();

          await orderCancelletionPublisher.disconnect();
          await orderCreationPublisher.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
      // for closing the terminal
      process.on("SIGHUP", async () => {
        try {
          await ticketCreationListener.disconnect();
          await ticketUpdateListener.disconnect();
          await orderExpirationListener.disconnect();
          await paymentCreationListener.disconnect();

          await orderCancelletionPublisher.disconnect();
          await orderCreationPublisher.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
    } catch (err) {
      console.log("Here are the error");
      console.log(err);
      // console.log(err);
      process.exit(1);
    }
  });
};

start();
