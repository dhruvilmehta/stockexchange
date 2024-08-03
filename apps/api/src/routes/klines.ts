import prisma from "@repo/prisma-client/client";
import { NextFunction, Request, Response, Router } from "express";

export const klineRouter = Router();

export interface KLine {
    close: string;
    high: string;
    low: string;
    open: string;
    quoteVolume: string;
    start: string;
    end: string;
    trades: string;
    volume: string;
}

klineRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const companyName = (req.query.symbol as string).split("_")[0];
    const interval = decodeURIComponent(req.query.interval as string);
    const startTime = decodeURIComponent(req.query.startTime as string)
    const endTime = decodeURIComponent(req.query.endTime as string)

    if (!interval || !companyName) {
        return res.status(404).json({ message: "Interval or Company name not found" });
    }

    const allowedIntervals = ['1 minute', '5 minutes', '10 minutes', '15 minutes', '1 hour'];
    if (!allowedIntervals.includes(interval)) {
        return res.status(404).json({ message: `Invalid interval. Allowed intervals are: ${allowedIntervals.join(', ')}` });
    }

    console.log("Interval ", interval);

    // Ensure interval is formatted correctly for PostgreSQL
    // const formattedInterval = `'${interval}'::interval`;
    const query = `
        SELECT
        time_bucket($1::interval, "time") AS bucket,
        first("price", "time") AS open,
        max("price") AS high,
        min("price") AS low,
        last("price", "time") AS close,
        sum("volume" * "price") AS quoteVolume,
        sum("volume") AS volume,
        count(*)::integer AS trades,
        time_bucket($1::interval, "time") AS start,
        time_bucket($1::interval, "time") + $1::interval AS end
        FROM "Prices"
        WHERE "companyName" = $2
        AND "time" >= $3::timestamp
        AND "time" <= $4::timestamp
        GROUP BY bucket
        ORDER BY bucket;
    `;

    try {
        const klines: KLine[] = await prisma.$queryRawUnsafe(query, interval, companyName, new Date(Number(startTime) * 1000), new Date(Number(endTime) * 1000))

        return res.status(200).send(klines);
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
