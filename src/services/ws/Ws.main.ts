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
        console.log("Connection message", msg);
        this.handlers(socket, msg);
      });

      socket.on("close", (data) => {
       
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
      case "joinUser":
        this.room.joinRoom(`userId:${msg.userId}`, socket);
        break;
      case "joinVendor":
        this.room.joinRoom(`vendorId:${msg.vendorId}`, socket);
        break;
      default:
        break;
    }
  }

  public sendToUser(userId: string, message: any) {
    this.room.broadCastInRoom(`userId:${userId}`, message);
  }

  public sendToVendor(vendorId: string, message: any) {
    this.room.broadCastInRoom(`vendorId:${vendorId}`, message);
  }
}
