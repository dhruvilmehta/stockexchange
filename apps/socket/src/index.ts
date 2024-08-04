import { UserManager } from "./UserManager";
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'

dotenv.config()

const app = express()

app.get("/", (req, res) => {
    return res.status(200).send("Socket Working")
})

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
// const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});

server.listen(3000, () => {
    console.log("Socket running http on port 3000")
})