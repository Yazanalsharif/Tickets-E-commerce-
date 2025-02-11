import { Listener, OrderCreation, Subjects } from "@yalsharif/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";
import { queue } from "../../queue/queueSetup";

export class OrderCreationListener extends Listener<OrderCreation> {
  subject: Subjects.OrderCreation = Subjects.OrderCreation;
  queueGroupName: string = queueGroupName;

  onMessage(data: OrderCreation["data"], msg: Message) {
    try {
      // The service will listen to the order creation event Here
      console.log(
        "Received a message [" +
          msg.getSequence() +
          "] Order Created / Expiration Service" +
          " " +
          process.env.CLIENT_ID
      );

      // Get the current Time in Timestamp
      let currentDate = new Date().getTime();

      // Calculate the delay timestamp
      let expireTimeStamp = new Date(data.expiration).getTime() - currentDate;

      // Pass only the orderId
      queue.add(
        {
          orderId: data.id,
        },
        {
          // in millisecound
          delay: expireTimeStamp,
        }
      );

      msg.ack();
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Expiration Service");
      console.log(err);
    }
  }
}
