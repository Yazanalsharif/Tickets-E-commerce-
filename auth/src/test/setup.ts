import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: any;

process.env.Node_Env = "test";

beforeAll(async () => {
  process.env.JWT_KEY = "TEST";

  // Create the memory server for test mongodb
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  // Connect the database
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // clear the database before each
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Stop the connection with databases
  if (mongod) {
    await mongod.stop();
  }
  await mongoose.connection.close();
});
