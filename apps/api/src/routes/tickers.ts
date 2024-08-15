
import { Request, Router, Response, NextFunction } from "express";
// import prisma from "@repo/prisma-client/client";
import prisma from "../prisma";

export const tickerRouter = Router();

export interface TickerType {
    "firstPrice": string,
    "high": string,
    "lastPrice": string,
    "low": string,
    "priceChange": string,
    "priceChangePercent": string,
    "quoteVolume": string,
    "symbol": string,
    "trades": string,
    "volume": string
}

tickerRouter.get("/", async (req: Request, res: Response) => {
    const now = new Date();
    const endTime = now;
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const user = await prisma.prices.findMany()
    console.log(user)
    try {
        const query = `
    SELECT
        "companyName" AS "symbol",
        first("price", "time") AS "firstPrice",
        max("price") AS "high",
        last("price", "time") AS "lastPrice",
        min("price") AS "low",
        (last("price", "time") - first("price", "time")) AS "priceChange",
        ((last("price", "time") - first("price", "time")) / first("price", "time")) * 100 AS "priceChangePercent",
        sum("volume" * "price") AS "quoteVolume",
        count(*)::integer AS "trades",
        sum("volume") AS "volume"
    FROM
        "Prices"
    WHERE
        "time" >= $1::timestamp
        AND "time" <= $2::timestamp
    GROUP BY
        "companyName";
`;
        console.log(user, " Here")
        const tickerData: TickerType[] = await prisma.$queryRawUnsafe(query, startTime, endTime);

        return res.status(200).json(tickerData);
    } catch (error) {
        console.log(error)
        console.error("Error fetching tickerf data");
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
