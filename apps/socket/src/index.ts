import { UserManager } from "./UserManager";
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv'

dotenv.config()
const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});