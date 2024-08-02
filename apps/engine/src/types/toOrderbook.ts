export enum MessageToOrderbookTypes {
    CREATE_ORDER = "CREATE_ORDER",
    CANCEL_ORDER = "CANCEL_ORDER",
    ON_RAMP = "ON_RAMP",
    GET_OPEN_ORDERS = "GET_OPEN_ORDERS",
    GET_DEPTH = "GET_DEPTH",
    GET_USER_BALANCE = "GET_USER_BALANCE"
}
import { OrderSide } from "./OrderSide"

export type MessageToOrderbook = {
    type: MessageToOrderbookTypes.CREATE_ORDER,
    data: {
        market: string,
        price: string,
        quantity: string,
        side: OrderSide,
        userId: string
    }
} | {
    type: MessageToOrderbookTypes.CANCEL_ORDER,
    data: {
        orderId: string,
        market: string,
    }
} | {
    type: MessageToOrderbookTypes.ON_RAMP,
    data: {
        amount: string,
        userId: string,
        txnId: string
    }
} | {
    type: MessageToOrderbookTypes.GET_DEPTH,
    data: {
        market: string,
    }
} | {
    type: MessageToOrderbookTypes.GET_OPEN_ORDERS,
    data: {
        userId: string,
        market: string,
    }
} | {
    type: MessageToOrderbookTypes.GET_USER_BALANCE,
    data: {
        userId: string,
        asset: string
    }
}