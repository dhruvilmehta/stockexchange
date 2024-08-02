import { UserManager } from "./UserManager";
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3002 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});