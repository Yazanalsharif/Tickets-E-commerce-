import { Kafka, Producer } from "kafkajs";
import { Subjects } from "./utils/subjects";
import { Event } from "./Listener-kafka";

export abstract class Publisher<T extends Event> {
  private client: Kafka;
  public producer?: Producer;

  abstract topic: T["subject"];

  constructor(client: Kafka) {
    this.client = client;
  }

  async connect(): Promise<void> {
    const producer = this.client.producer();

    this.producer = producer;

    await this.producer.connect();
  }

  async publish(data: T["data"]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.producer?.send({
          topic: this.topic,
          messages: [
            {
              key: `Key ${Math.round(Math.random() * 1000)}`,
              value: JSON.stringify(data),
            },
          ],
        });

        resolve();
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    try {
      this.producer?.disconnect();
      console.log("producer has been disconnect to the broker");
    } catch (err) {
      console.log("error in disconneting the Producer", this.topic);
      console.log(err);
    }
  }
}
