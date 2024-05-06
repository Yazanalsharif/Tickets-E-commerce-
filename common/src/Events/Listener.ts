import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./utils/subjects";

export interface Events {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Events> {
  // properties
  private ackAwait: number = 5000;
  private client: Stan;

  // Abstract properites
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): any;

  constructor(client: Stan) {
    this.client = client;
  }

  // Function listen used to the services to listen to others services
  listen(): void {
    let subscribeOpt = this.getSubscriptionObtion();

    let subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      subscribeOpt
    );

    // abstract function will be implemented later in child classes
    subscription.on("message", (msg: Message) => {
      // Parse the incoming data and convert it to the object
      let data = this.parseData(msg.getData());
      this.onMessage(data, msg);
      // Acknowldge the publisher that the event received and published
      msg.ack();
    });
  }

  // Helper function to parse the data coming from the publisher and converted it to the object
  parseData(data: String | Buffer) {
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }

  // Add options by subscriptionOption Chain.
  // Manual Ack Mode is for let the subscriper Manually acknwoldge the publisher that the event has been recieved and processed
  // set Ack Wait is the time for waiting the Ack from the subscriper
  // if the Manual Ack mode has been setuped then you should manually ack the publisher otherwise the publisher will send the event again
  // After waiting the Ack Time
  getSubscriptionObtion() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroupName)
      .setAckWait(this.ackAwait);
  }
}
