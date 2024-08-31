import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order";
import errorHandler from "./errorHandler";
import { depthRouter } from "./routes/depth";
import { tradesRouter } from "./routes/trades";
import { klineRouter } from "./routes/klines";
import { tickerRouter } from "./routes/tickers";
import dotenv from "dotenv"
import { authRouter } from "./routes/auth";
import { balanceRouter } from "./routes/balance";
import axios from 'axios'
import { main } from "./db";

dotenv.config()

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter)
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/klines", klineRouter);
app.use("/api/v1/tickers", tickerRouter);
app.use("/api/v1/getBalance", balanceRouter)
app.use(errorHandler)

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
main()

// setInterval(async () => {
//     try {
//         const response = await axios.get("https://stockexchange-engine.onrender.com")
//         if (response.status === 200) console.log("Engine Healthy")
//         else console.log("Problem with engine")
//     } catch (error) {
//         console.log("Problem with engine")
//     }
// }, 30000)

// setInterval(async () => {
//     try {
//         const response = await axios.get("https://stockexchange-db.onrender.com")
//         if (response.status === 200) console.log("Db Healthy")
//         else console.log("Problem with Db")
//     } catch (error) {
//         console.log("Problem with Db")
//     }
// }, 30000)

// setInterval(async () => {
//     try {
//         const response = await axios.get("https://stockexchange-mm.onrender.com")
//         if (response.status === 200) console.log("mm Healthy")
//         else console.log("Problem with mm")
//     } catch (error) {
//         console.log("Problem with mm")
//     }
// }, 30000)

// setInterval(async () => {
//     try {
//         const response = await axios.get("https://stockexchange-socket.onrender.com")
//         if (response.status === 200) console.log("Socket Healthy")
//         else console.log("Problem with socket")
//     } catch (error) {
//         console.log("Problem with socket")
//     }
// }, 30000)