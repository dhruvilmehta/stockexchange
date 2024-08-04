import { NextFunction, Request, Response, Router } from "express";
import { RedisManager } from "../RedisManager";
import { MessageToOrderbook, MessageToOrderbookTypes } from "../types/toOrderbook";
import { MessageFromOrderbook, MessageFromOrderbookTypes } from "../types/fromOrderbook"
import { CustomError } from "../CustomError";

export const depthRouter = Router();

//Get Depth
depthRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await RedisManager.getInstance().sendAndAwait({
            type: MessageToOrderbookTypes.GET_DEPTH,
            data: {
                market: req.query.symbol as string
            }
        }) as Extract<MessageFromOrderbook, { type: MessageFromOrderbookTypes.DEPTH }>;;

        if (!response) throw new CustomError("Not received any response", 404)

        res.status(201).json(response.payload);
    } catch (error) {
        next(error)
    }
});
