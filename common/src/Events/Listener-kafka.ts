import { Subjects } from "./utils/subjects";
import { Kafka, Consumer, EachMessagePayload } from "kafkajs";

export interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  protected client: Kafka;
  private ackTime: number = 1000;
  public consumer?: Consumer;

  abstract onMessage(
    data: T["data"],
    payload: EachMessagePayload
  ): Promise<void>;
  abstract queueGroupName: string;
  abstract topic: Event["subject"];

  // identify the client with the kafka instanse
  constructor(client: Kafka) {
    this.client = client;
  }

  async listen(): Promise<void> {
    // Identify the consumer which it will listen to a specific topic for the queueGroup
    const consumer = this.client.consumer({ groupId: this.queueGroupName });
    this.consumer = consumer;

    await this.consumer.connect();

    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

    await consumer.run({
      autoCommit: false,
      eachMessage: async (payload: EachMessagePayload) => {
        // Only if received data
        if (payload.message.value) {
          const data = this.parseData(payload.message.value);
          this.onMessage(data, payload);
        }
      },
    });
  }

  parseData(data: string | Buffer) {
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer?.disconnect();
      console.log("Disconnect the Consumer", this.topic);
    } catch (err) {
      console.log("Error in disconnecting the consumer");
      console.log(err);
    }
  }
}
