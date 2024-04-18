import request from "supertest";
import { app } from "../app";

const signin = async (): Promise<string[]> => {
  let email = "yazanalsharif@gmail.com";
  let password = "Password134";

  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  let cookie = response.get("Set-Cookie");

  console.log(cookie);

  return cookie;
};

export { signin };
