import mongoose from "mongoose";
import chalk from "chalk";

async function dbConnection() {
  await mongoose.connect("mongodb://auth-mongo-srv/User");

  console.log(chalk.yellow("The auth-db is connected..."));
}

export { dbConnection };
