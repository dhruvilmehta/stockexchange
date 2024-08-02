import { OrderSide } from "./OrderSide"

export enum DbMessageType {
    TRADE_ADDED, ORDER_UPDATE
}

export type DbMessage = {
    type: DbMessageType.TRADE_ADDED,
    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    }
} | {
    type: DbMessageType.ORDER_UPDATE,
    data: {
        orderId: string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: OrderSide
    }
}