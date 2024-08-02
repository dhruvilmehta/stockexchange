import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { CustomError } from "../CustomError";

interface CustomJwtPayload extends jwt.JwtPayload {
  userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.headers)
  const token = req.headers["authorization"] || req.headers["Authorization"];
  console.log(token, "Token")

  try {
    if (!token) {
      // throw new CustomError("Token not found", 401)
      return res.status(401).json({message: "Token not found"})
    }
    const decoded = jwt.verify(token as string, JWT_SECRET) as CustomJwtPayload;
    // req.userId = decoded.userId;
    req.userId = "1";
    next();
  } catch (err) {
    next(err)
  }

}