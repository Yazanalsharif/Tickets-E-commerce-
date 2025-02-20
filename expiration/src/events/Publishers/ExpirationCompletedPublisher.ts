import { Publisher1, ExpirationCompleted, Subjects } from "@yalsharif/common";

class ExpirationCompletedPublisher extends Publisher1<ExpirationCompleted> {
  topic: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;

  publish(data: ExpirationCompleted["data"]): Promise<void> {
    console.log(
      "Expiration Completed Publisher, Published an event",
      this.topic
    );
    return super.publish(data);
  }
}

const expirationCompletedPublisher = new ExpirationCompletedPublisher();

export { expirationCompletedPublisher };
