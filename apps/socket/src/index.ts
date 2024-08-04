import { UserManager } from "./UserManager";
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()

app.get("/", (req, res) => {
    return res.status(200).send("Socket Working")
})

const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});

app.listen(3000, () => {
    console.log("Socket running http on port 3000")
})