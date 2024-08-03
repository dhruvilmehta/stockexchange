import { Router, Request, Response, NextFunction } from "express";
import { RedisManager } from "../RedisManager";
// import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_OPEN_ORDERS, MessageFromOrderbook } from "../types";
import { authMiddleware } from "../middleware/authMiddleware";
import { MessageToOrderbook, MessageToOrderbookTypes } from "../types/toOrderbook";
import { MessageFromOrderbook, MessageFromOrderbookTypes } from "../types/fromOrderbook";
// import { CustomError } from "@repo/types/src/customError";
import { CustomError } from "../CustomError";
import { OrderSide } from "../types/OrderSide";

export const orderRouter = Router();


//Create Order
orderRouter.post("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    type CreateOrderRequestBodyType = { market: string, price: string, quantity: string, side: OrderSide }
    const { market, price, quantity, side }: CreateOrderRequestBodyType = req.body;
    const userId = req.userId
    // console.log("CREATE ORDER REQUEST")

    try {
        const response = await RedisManager.getInstance().sendAndAwait({
            type: MessageToOrderbookTypes.CREATE_ORDER,
            data: {
                market,
                price,
                quantity,
                side,
                userId
            }
        }
        ) as Extract<MessageFromOrderbook, { type: MessageFromOrderbookTypes.ORDER_PLACED }>;

        if (!response) throw new CustomError('Order not placed', 404);

        res.status(200).json(response.payload);
    } catch (error) {
        next(error);
    }
});

// Delete order
orderRouter.delete("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    type DeleteOrderRequestBodyType = { orderId: string, market: string }
    const { orderId, market }: DeleteOrderRequestBodyType = req.body;

    try {
        const response = await RedisManager.getInstance().sendAndAwait({
            type: MessageToOrderbookTypes.CANCEL_ORDER,
            data: {
                orderId,
                market
            }
        }
        ) as Extract<MessageFromOrderbook, { type: MessageFromOrderbookTypes.ORDER_CANCELLED }>;

        if (!response) throw new CustomError('Order not deleted', 404);

        res.status(200).json(response.payload);
    } catch (error) {
        next(error)
    }
});

// Get all open orders
orderRouter.get("/open", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log("In open orders")
        if (!req.query.market) return res.status(404).json({ message: "Market not passed in" })
        const response = await RedisManager.getInstance().sendAndAwait({
            type: MessageToOrderbookTypes.GET_OPEN_ORDERS,
            data: {
                userId: req.userId,
                market: req.query.market as string
            }
        }
        ) as Extract<MessageFromOrderbook, { type: MessageFromOrderbookTypes.OPEN_ORDERS }>;

        if (!response) throw new CustomError("Error while fetching all open orders", 404)

        res.status(201).json(response.payload);
    } catch (error) {
        next(error)
    }
});