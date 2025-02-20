import { Kafka } from "kafkajs";
class KafkaWrapper {
  private _client?: Kafka;

  // Connect with the client funciton
  connect(clientId: string, urls: string[]): void {
    let kafkaClient = new Kafka({ clientId, brokers: urls, logLevel: 0 });
    this._client = kafkaClient;
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
