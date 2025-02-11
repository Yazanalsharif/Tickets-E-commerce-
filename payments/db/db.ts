import mongoose from "mongoose";

const dbConnection = async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  console.log("The Payments-db is connected...");
};

export { dbConnection };
