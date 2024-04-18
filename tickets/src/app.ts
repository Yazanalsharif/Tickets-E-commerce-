import express from "express";
import cookieSession from "cookie-session";
import { json } from "express";
import { errorHandler } from "@yalsharif/common";

import { createTicket } from "./router/new";
import { getTicketsRouter } from "./router/getTickets";
import { updateTicketRouter } from "./router/update";

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
app.use("/api/tickets", createTicket);
app.use("/api/tickets", getTicketsRouter);
app.use("/api/tickets", updateTicketRouter);

// error handler middle ware for catching the application error
app.use(errorHandler);

export { app };
