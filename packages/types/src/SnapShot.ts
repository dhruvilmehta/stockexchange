import { Order } from "./Order";

export type SnapShotType = {
    baseAsset: string;
    bids: Order[];
    asks: Order[];
    lastTradeId: number;
    currentPrice: number;
}