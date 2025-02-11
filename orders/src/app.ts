import express, { NextFunction, Request, Response } from "express";
import cookieSession from "cookie-session";
import { json } from "express";
import { errorHandler } from "@yalsharif/common";
import { NotFoundError } from "@yalsharif/common";

import { CreateOrder } from "./routers/new";
import { getOrdersRouter } from "./routers/getOrders";
import { cancellOrderRouter } from "./routers/cancellOrder";

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

// Setup json middleware for communication
app.use(json());

// Here we are handling the routers
app.use("/api/orders", CreateOrder);
app.use("/api/orders", getOrdersRouter);
app.use("/api/orders", cancellOrderRouter);

// listen to unknown routes
app.all("*", async (req: Request, res: Response, next: NextFunction) => {
  console.log("The route doesn't exist.. ", req.path);
  next(new NotFoundError("The Route Not Found...."));
});

// error handler middle ware for catching the application error
app.use(errorHandler);

export { app };
