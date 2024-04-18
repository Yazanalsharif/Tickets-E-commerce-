import { app } from "../../app";
import request from "supertest";

test("Signin succusfully return 200 code and the user", async () => {
  let email = "yazanalsharif@gmail.com";
  let password = "test2345";
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  const signInRes = await request(app)
    .post("/api/users/signin")
    .send({
      email,
      password,
    })
    .expect(200);

  expect(signInRes.body.user).toBeDefined();
});

test("Check signin with user does not exist", async () => {
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@gmail.com",
      password: "test123",
    })
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
  expect(response.body.errors[0].message).toEqual("User Doesn't exist");
});

// Test sign in with the wrong password return Invalid data
test("Sign in with the wrong password return 400 Error with messsage Credintials Invalid", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test2345",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test23457",
    })
    .expect(400);

  expect(response.body.errors[0]).toBeDefined();
  expect(response.body.errors[0].message).toEqual("Invalid credentials");
});

test("Sign In the user return JWT token in Cookie", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test2345",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "test2345",
    })
    .expect(200);

  let cookie = response.get("Set-Cookie");

  let cookieSission = cookie[0].split("=");

  expect(cookie).toBeDefined();
  expect(cookie[0]).toBeDefined();
  expect(cookieSission[0]).toEqual("session");
  expect(cookieSission[1]).toBeDefined();
});
