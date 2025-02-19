import { Kafka } from "kafkajs";
class KafkaWrapper {
  private _client?: Kafka;

  // Connect with the client funciton
  connect(clientId: string, urls: string[]): void {
    // this._client = new Kafka({ clientId, brokers: urls, logLevel: 0 });
    let kafkaClient = new Kafka({ clientId, brokers: urls, logLevel: 0 });
    this._client = kafkaClient;
    // return new Promise(async (resolve, reject) => {
    //   try {
    //     // Create a new kafka instance
    //     const admin = this._client?.admin();
    //     await admin?.connect();
    //     console.log("The Kafka is succusfully connected to [ticket] service");
    //      resolve();
    //   } catch (err) {
    //     console.log("Error in connecting Kafka to the [tickets] srv");
    //     reject("The connection is rejected");
    //   }
    // });
  }

  get client() {
    if (!this._client) {
      throw Error("Kafka client are not connected");
    }

    return this._client;
  }
}

const kafkaWrapper = new KafkaWrapper();

export { kafkaWrapper };
