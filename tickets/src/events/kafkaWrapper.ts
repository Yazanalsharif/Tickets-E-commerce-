import { Kafka } from "kafkajs";
class KafkaWrapper {
  private _client?: Kafka;

  // Connect with the client funciton
  connect(clientId: string, urls: string[]): void {
    this._client = new Kafka({ clientId, brokers: urls, logLevel: 0 });
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
