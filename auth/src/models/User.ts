import mongoose from "mongoose";
import { PasswordManager } from "../services/PasswordManager";

// Interface describe the user attributes for creating a use
interface UserAttr {
  email: string;
  password: string;
}

// Interface that describe the user document
// that the model has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  createdAt: Date;
}

// Interface that describes the properties of the user model
// that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(user: UserAttr): UserDoc;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    toJSON: {
      transform(doc, ref, options) {
        delete ref.password;
        delete ref.__v;
        ref.id = ref._id;
        delete ref._id;
      },
    },
  }
);

// Creaete new user function
UserSchema.statics.build = (user: UserAttr) => {
  return new User(user);
};

// Execute the function before saving the document
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const hashed = await PasswordManager.hash(this.get("password") as string);
  this.set("password", hashed);

  next();
});

const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);

export { User };
