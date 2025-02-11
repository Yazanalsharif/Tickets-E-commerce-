import { Publisher, ExpirationCompleted, Subjects } from "@yalsharif/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleted> {
  subject: Subjects = Subjects.ExpirationCompleted;

  publish(data: ExpirationCompleted["data"]): Promise<void> {
    // Make sure that only the data schema will be send to the super function
    return super.publish(data);
  }
}
