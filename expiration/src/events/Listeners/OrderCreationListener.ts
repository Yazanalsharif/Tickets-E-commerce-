import { Kafka, EachMessagePayload } from "kafkajs";
import { Listener1, OrderCreation, Subjects } from "@yalsharif/common";
import { queueGroupName } from "./queueGroupName";
import { queue } from "../../queue/queueSetup";

export class OrderCreationListener1 extends Listener1<OrderCreation> {
  queueGroupName: string = queueGroupName;
  topic: Subjects = Subjects.OrderCreation;

  async onMessage(
    data: OrderCreation["data"],
    payload: EachMessagePayload
  ): Promise<void> {
    console.log(
      "Received a message [" +
        payload.partition +
        "] Order Created / Expiration Service" +
        " " +
        process.env.CLIENT_ID
    );

    try {
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
      console.log("The order will cancel in", expireTimeStamp / 1000);
      await this.consumer?.commitOffsets([
        {
          topic: payload.topic,
          partition: payload.partition,
          offset: (parseInt(payload.message.offset || "1", 10) + 1).toString(),
        },
      ]);
    } catch (err) {
      console.log("ERROR | OrderCreationListener | Expiration Service");
      console.log(err);
    }
  }
}
