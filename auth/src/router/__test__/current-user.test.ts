import { app } from "../../app";
import request from "supertest";
import { signin } from "../../test/helper";

test("return current user as null if the user not authed", async () => {
  const response = await request(app)
    .post("/api/users/currentUser")
    .send({})
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
  expect(response.body.currentUser).toBeNull();
});

test("it should return the user when it authorized", async () => {
  let cookie = await signin();

  let response = await request(app)
    .post("/api/users/currentUser")
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(response.body.currentUser).toBeDefined();
});
