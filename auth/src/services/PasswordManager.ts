import { scrypt, randomBytes } from "crypto";

class PasswordManager {
  //
  static async hash(password: string): Promise<string> {
    // create a salt, Random of bytes and convert it to the string hex
    const salt = randomBytes(16).toString("hex");
    // derived Key Buffer which we will create the password from it
    const derivedKeyBuffer = await asyncScrypt(password, salt);
    const hashedPassword = `${derivedKeyBuffer.toString("hex")}.${salt}`;
    // The hashed passwod logs

    return hashedPassword;
  }

  // Compare two passwords, hashed and not hashed
  static async compare(password: string, storedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const derivedKeyBuffer = await asyncScrypt(password, salt);

    const isCompared = hashedPassword === derivedKeyBuffer.toString("hex");

    return isCompared;
  }
}

function asyncScrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 2 ** 14, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export { PasswordManager };
