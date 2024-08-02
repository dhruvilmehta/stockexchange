import { NextFunction, Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { RedisManager } from '../RedisManager';
import { MessageToOrderbookTypes } from '../types/toOrderbook';
import { MessageFromOrderbook, MessageFromOrderbookTypes } from '../types/fromOrderbook';
import { CustomError } from '../CustomError';

export const balanceRouter = Router()

balanceRouter.get("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const asset: string = req.query.asset as string;
    console.log("Asset", asset)

    try {
        const response = await RedisManager.getInstance().sendAndAwait({
            type: MessageToOrderbookTypes.GET_USER_BALANCE,
            data: {
                userId: "1" || req.userId,
                asset: asset
            }
        }) as Extract<MessageFromOrderbook, { type: MessageFromOrderbookTypes.USER_BALANCE }>;;

        if (!response) throw new CustomError("Not received any response", 404)

        res.status(201).json(response.payload);
    } catch (error) {
        next(error)
    }
})