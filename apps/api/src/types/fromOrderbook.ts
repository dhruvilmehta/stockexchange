import { Fill } from "./Fill"
import { Order } from "./Order"
import { Depth } from "./Depth"

export enum MessageFromOrderbookTypes {
    ORDER_PLACED = "ORDER_PLACED",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    DEPTH = "DEPTH",
    OPEN_ORDERS = "OPEN_ORDERS",
    USER_BALANCE = "USER_BALANCE"
}

export type MessageFromOrderbook = {
    type: MessageFromOrderbookTypes.DEPTH,
    payload: Depth
} | {
    type: MessageFromOrderbookTypes.ORDER_PLACED,
    payload: {
        orderId: string,
        executedQty: number,
        fills: Fill[]
    }
} | {
    type: MessageFromOrderbookTypes.ORDER_CANCELLED,
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
} | {
    type: MessageFromOrderbookTypes.OPEN_ORDERS,
    payload: Order[]
} | {
    type: MessageFromOrderbookTypes.USER_BALANCE,
    payload: {
        asset: string,
        balance: string
    }
}