import { app } from "../../app";
import request from "supertest";
import { User } from "../../models/User";

// check if the user can signup with valid data.
test("Valid email can sign up", async () => {
  let response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "Yazan2000",
    })
    .expect(201);

  // Expect that the errors in undefined
  expect(response.body.errors).toBeUndefined();
  // the response should return the user
  expect(response.body.user.email).toBeDefined();

  let user = await User.findOne({ email: response.body.user.email });

  // Expect that the user is stored in the database
  expect(user).toBeDefined();
});

test("No data is a invalid request", async () => {
  await request(app).post("/api/users/signup").send().expect(400);
});

test("unvalid email can not sign up", async () => {
  let response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif",
      password: "Yazan2000",
    })
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
});

test("unvalid password can not sign up", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "2000",
    })
    .expect(400);

  expect(response.body.errors[0].message).toBeDefined();
});

test("disallows duplicate emails ", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "Yazan2000",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "yazanalsharif@gmail.com",
      password: "Yazan2000",
    })
    .expect(400);
});

// The user returning the cookie
test("The user return cookie when he signup", async () => {
  const response = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "test1234",
  });

  expect(response.get("Set-Cookie")[0]).toBeDefined();

  // decode the session base64
  // Verify the JWT and take the payload.
  // compare the payload with the email
});
