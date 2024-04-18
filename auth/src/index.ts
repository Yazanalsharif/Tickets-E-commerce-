import { app } from "./app";
import chalk from "chalk";
import { dbConnection } from "../db/db";

const start = async () => {
  let port = process.env.PORT || 3000;

  // Listening to the port 3000
  app.listen(port, async () => {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY ITS NOT ADDED");
    }

    console.log(chalk.green("Auth Service running on port", port));
    await dbConnection();
  });
};

start();
