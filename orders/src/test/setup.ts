import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";

let mongod: any;

process.env.Node_Env = "test";

process.env.JWT_KEY = "test";

declare global {
  var fakeAuth: () => string[];
}

jest.mock("../events/Nats.ts");

// Create a mongoMemoryServices
beforeAll(async () => {
  // This will create an new instance of "MongoMemoryServer" and automatically start it
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
});

// Clear Mocks and all databases collections
beforeEach(async () => {
  jest.clearAllMocks();
  // clear the database before each
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Stop the mongo
afterAll(async () => {
  // Stop the connection with databases
  if (mongod) {
    await mongod.stop();
  }
  await mongoose.connection.close();
});

// Glbal function Fake auth that faking the auth to the users to test if they are authorized
global.fakeAuth = (): string[] => {
  // user email will be signed
  const user = {
    id: new Types.ObjectId(),
    email: "test@test.com",
  };

  // create JWT token {token: 'JWT TOKEN'}
  let token = jwt.sign(user, process.env.JWT_KEY!);

  // Object of the token: jwt token
  let tokenObject = {
    token,
  };

  // stringigy the JWT object to get string
  let strJwtObject = JSON.stringify(tokenObject);

  // Encode the jwtToken object to Base64
  let encodedJwt = Buffer.from(strJwtObject, "binary").toString("base64");

  let session: string[] = [];

  // Assign encode jwt to the session and should start with session=encodedObject, Session work like that
  session[0] = `session=${encodedJwt}`;

  // Retrun the session
  return session;
};
