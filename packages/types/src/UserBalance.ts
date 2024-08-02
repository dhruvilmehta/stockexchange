export type UserBalance = {
    [key: string]: {
        available: number;
        locked: number;
    };
}