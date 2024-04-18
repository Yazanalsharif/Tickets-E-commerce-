import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";

// Interface for returning the payload data
interface UserPayload {
  id: string;
  email: string;
}

// Declare a currentUser variable in the Global Request interface
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export function currentUserMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // complete here...
  if (!req.session?.token) {
    return next();
  }

  try {
    let payload = jwt.verify(
      req.session.token,
      process.env.JWT_KEY!
    ) as UserPayload;

    req.currentUser = payload;
  } catch (err) {}

  next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.currentUser) {
    next(new NotAuthorizedError());
  }

  next();
}
