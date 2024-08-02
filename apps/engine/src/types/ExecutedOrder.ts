import { Fill } from "./Fill"

export type ExecutedOrder = {
    executedQty: number,
    fills: Fill[]
}