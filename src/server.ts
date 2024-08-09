import WebSocket, { WebSocketServer } from "ws";
import { isServerDraw, ServerDraw } from "./shared";

const drawings: ServerDraw[] = [];

const wss = new WebSocketServer({ port: 8080 });
const sockets = new Set<WebSocket>();

wss.on("connection", (ws: WebSocket) => {
  console.log("new connection");
  sockets.add(ws);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data.toString());

    if (isServerDraw(message)) {
      drawings.push({
        kind: "draw",
        x0: message.x0,
        y0: message.y0,
        x1: message.x1,
        y1: message.y1,
      });
    }

    for (const socket of sockets) {
      socket.send(event.data);
    }
  };

  ws.send(
    JSON.stringify({
      kind: "state",
      drawings,
    })
  );
});
