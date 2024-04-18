import express from "express";
import { json } from "express";
import cookieSession from "cookie-session";
import { errorHandler } from "@yalsharif/common";

// import Routers
import { userRouter } from "./router/users";

// App for the express
const app = express();

app.set("trust proxy", true);

// The cookie is setupped now
// Make it secure after a dev env
app.use(
  cookieSession({
    signed: false,
    secure: process.env.Node_Env !== "test",
  })
);
console.log(process.env.Node_Env);
app.use(json());

// setup the routers
app.use("/api/users", userRouter);

app.use(errorHandler);

export { app };
