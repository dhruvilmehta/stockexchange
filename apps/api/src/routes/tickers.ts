
import { Request, Router, Response, NextFunction } from "express";

export const tickersRouter = Router();

tickersRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "Feature in progress" });
});