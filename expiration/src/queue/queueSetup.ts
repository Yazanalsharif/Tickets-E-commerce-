import Queue, { Job } from "bull";
import { queueGroupName } from "../events/Listeners/queueGroupName";
import { ExpirationCompletedPublisher } from "../events/Publishers/expiration-completed-publisher";
import { natsServer } from "../events/Nats";

interface Payload {
  orderId: string;
}

const queue = new Queue<Payload>(queueGroupName, {
  redis: process.env.REDIS_URL!,
});

// Another way
interface orderData extends Job {
  data: {
    orderId: string;
  };
}

// Process the event
queue.process(async (job: orderData, done: Queue.DoneCallback) => {
  console.log("The order is expired,", job.data.orderId);

  // publish new Event for cancelling the Order after the expire date has been crossed
  new ExpirationCompletedPublisher(natsServer.client).publish({
    orderId: job.data.orderId,
  });
  // Added recentaly and did not tested
  done();
});

export { queue };
