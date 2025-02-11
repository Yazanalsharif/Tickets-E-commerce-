import nats, { Stan } from "node-nats-streaming";

class Nats {
  private _client?: Stan;

  async connect(
    clusterId: string,
    clientId: string,
    url: string
  ): Promise<void> {
    this._client = nats.connect(clusterId, clientId, {
      url,
    });

    return new Promise((resolve, reject) => {
      this._client!.on("connect", async () => {
        console.log("Connection to Nats server has been stablished");
        resolve();
      });

      this._client!.on("error", async (err) => {
        console.log("Connection Error to Nats Server", err.message);
        reject(err);
      });
    });
  }

  get client() {
    if (!this._client) {
      throw new Error("Client does not exist, Please initial Nats first");
    }
    return this._client;
  }
}

const natsWrapper = new Nats();

export { natsWrapper };
