import express from "express";
import { errorHandler } from "@yalsharif/common";
import { json } from "express";

const app = express();

app.set("trust proxy", true);

// Setup json middleware for communication
app.use(json());

app.use(errorHandler);

export { app };
