import { NextFunction, Request, Response, Router } from "express";
// import prisma from "../prisma";
import prisma from "@repo/prisma-client/client"
import { CustomError } from "../CustomError";

export const tradesRouter = Router();

// Get trades
tradesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const market = req.query.symbol as string;
    // console.log(market)
    try {
        const prices: { price: number, time: Date }[] = await getCompanyPrices(market);

        return res.status(200).json(prices)
    } catch (error) {
        next(error)
    }
})

async function getCompanyPrices(market: string) {
    let prices: { price: number, time: Date }[]

    switch (market.toLowerCase()) {
        case 'tata_inr':
            prices = await prisma.prices.findMany({
                where: {
                    companyName: market.toLowerCase()
                },
                select: {
                    price: true,
                    time: true
                }
            })
            break;
        default:
            throw new CustomError(`No data available for company: ${market}`, 404);
    }

    return prices;
}
