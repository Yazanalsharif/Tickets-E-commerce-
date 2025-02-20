import { app } from "./app";
import { dbConnection } from "../db/db";
import { natsWrapper } from "./events/Nats";
import { kafkaWrapper } from "./events/kafkaWrapper";
// import { OrderCancelledListener } from "./events/Listeners/order-cancelled-listener";
// import { OrderCreationListener } from "./events/Listeners/order-creation-listener";
import { OrderCreationListener1 } from "./events/Listeners/order-createion-listener-kafka";
import { OrderCancelletionListener1 } from "./events/Listeners/order-cancellation-listener-kafka";
import { paymentCreationPublisher } from "./events/Publishers/PaymentCreationPublisher";
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

    if (!process.env.KAFKA_URL) {
      throw new Error("The Kafka url for the payments server not exist");
    }
    try {
      kafkaWrapper.connect(process.env.CLIENT_ID, [process.env.KAFKA_URL]);
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
      await paymentCreationPublisher.connect(kafkaWrapper.client);

      // Connect the listeners
      await orderCancelletionListener.listen();
      await orderCreationListener.listen();

      // For termination the terminal
      process.on("SIGTERM", async () => {
        try {
          await orderCancelletionListener.disconnect();
          await orderCreationListener.disconnect();
          await paymentCreationPublisher.disconnect();
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
          await paymentCreationPublisher.disconnect();
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
          await paymentCreationPublisher.disconnect();
        } catch (err) {
          console.log(err);
        }
        process.exit(1);
      });
    } catch (err) {
      console.log("Here are the error");
      // console.log(err);
      process.exit(1);
    }
  });
};

start();
