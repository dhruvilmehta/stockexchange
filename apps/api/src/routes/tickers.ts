
import { Request, Router, Response, NextFunction } from "express";
import prisma from "@repo/prisma-client/client";
import { Prisma } from "@prisma/client";

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
    // const companyName = (req.query.symbol as string).split("_")[0];
    // const interval = decodeURIComponent(req.query.interval as string);
    // const startTime = decodeURIComponent(req.query.startTime as string)
    // const endTime = decodeURIComponent(req.query.endTime as string)
    const now = new Date();
    const endTime = now;
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // if (!companyName) {
    //     return res.status(400).json({ message: "Symbol query parameter is required" });
    // }

    try {
        // const query = `
        //     SELECT
        //         time_bucket($1::interval, "time") AS bucket,
        //         first("price", "time") AS open,
        //         max("price") AS high,
        //         min("price") AS low,
        //         last("price", "time") AS close,
        //         sum("volume" * "price") AS quoteVolume,
        //         sum("volume") AS volume,
        //         count(*)::integer AS trades,
        //         time_bucket($1::interval, "time") AS start,
        //         time_bucket($1::interval, "time") + $1::interval AS end
        //     FROM
        //         "Prices"
        //     WHERE
        //         "companyName" = $2
        //         AND "time" >= $3::timestamp
        //         AND "time" <= $4::timestamp
        //     GROUP BY bucket
        //     ORDER BY bucket;
        // `;

        // const query = `
        //     SELECT
        //         first("price", "time") AS "firstPrice",
        //         max("price") AS "high",
        //         last("price", "time") AS "lastPrice",
        //         min("price") AS "low",
        //         (last("price", "time") - first("price", "time")) AS "priceChange",
        //         ((last("price", "time") - first("price", "time")) / first("price", "time")) * 100 AS "priceChangePercent",
        //         sum("volume" * "price") AS "quoteVolume",
        //         $1 AS "symbol",
        //         count(*)::integer AS "trades",
        //         sum("volume") AS "volume"
        //     FROM
        //         "Prices"
        //     WHERE
        //         "companyName" = $1
        //         AND "time" >= $2::timestamp
        //         AND "time" <= $3::timestamp;
        // `;

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



        const tickerData: TickerType[] = await prisma.$queryRawUnsafe(query, startTime, endTime);
        console.log(tickerData)

        return res.status(200).json(tickerData);
    } catch (error) {
        console.error("Error fetching ticker data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
