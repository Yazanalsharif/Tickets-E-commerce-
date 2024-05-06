import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./utils/subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  private client: Stan;
  abstract subject: Subjects;
  // Constructore to create instances from the child classes
  constructor(client: Stan | any) {
    this.client = client;
  }

  // Publish the event function
  publish(data: T["data"]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err, guid) => {
        if (err) {
          return reject(err);
        }

        console.log("published message with guid: " + guid);
        console.log("The data is", data);
        return resolve();
      });
    });
  }
}
