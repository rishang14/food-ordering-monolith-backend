import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager.ts";

export class RealTime {
  public wss: WebSocketServer;
  private room: RoomManager;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.room = new RoomManager();
    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (socket) => {
      socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        this.handlers(socket, msg);
      });
    });

    this.wss.on("headers", (headers) => {
      headers.push("Access-Control-Allow-Origin: *");
    });

    this.wss.on("error", () => {});
  }

  private handlers(socket: any, msg: any) {
    console.log("socket", socket);
    console.log("message", msg);

    switch (msg.type) {
      case "join-user":
        console.log("UserId", msg.userId);
        break;
      case "join-vendor":
        console.log("Vendor id", msg.vendorId);
        break;
      default:
        break;
    }
  }
}
