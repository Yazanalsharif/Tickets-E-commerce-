import { app } from "../../app";
import request from "supertest";

test("Sign out should return 200,", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test2345",
    })
    .expect(201);

  await request(app).post("/api/users/signout").send({}).expect(200);
});

test("signout should clear the cookie session", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test2345",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
  expect(response.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
