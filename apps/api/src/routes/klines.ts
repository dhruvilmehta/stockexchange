import { NextFunction, Request, Response, Router } from "express";

export const klineRouter = Router();

klineRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "Feature in progess" })
})