import { OrderSide } from "./OrderSide";

export type Order = {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: OrderSide.BUY | OrderSide.SELL;
    userId: string;
}