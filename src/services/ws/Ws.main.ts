import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager.ts";
import { ChatManager } from "./ChatManager.ts";

export class RealTime {
  public wss: WebSocketServer;
  private room: RoomManager;
  private chat: ChatManager;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.room = new RoomManager();
    this.chat = new ChatManager();
    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (socket) => {
      socket.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        console.log("Connection message", msg);
        this.handlers(socket, msg);
      });

      socket.on("close", () => {
        this.room.clearConnection(socket);
      });

      socket.on("error", () => {
        this.room.clearConnection(socket);
      });
    });
    this.wss.on("headers", (headers) => {
      headers.push("Access-Control-Allow-Origin: *");
    });
  }

  private async handlers(socket: any, msg: any) {
    console.log("message", msg);

    switch (msg.type) {
      case "joinUser":
        this.room.joinRoom(`user:${msg.userId}`, socket);
        break;
      case "joinVendor":
        this.room.joinRoom(`vendor:${msg.vendorId}`, socket);
        break;
      case "joinChat":
        this.room.joinRoom(`chat:${msg.chatId}`, socket);
        const data = await this.chat.getChatHistory(msg.chatId);
        socket.send(
          JSON.stringify({
            type: "chat.history",
            chatId: msg.chatId,
            messages: history,
          })
        );
        break;
      case "newMessage":
        await this.chat.addMessage(msg.chatId, msg.senderId, msg.message);
        this.room.broadCastInRoom(`chat:${msg.chatId}`, {
          type: "newMessage",
          senderId: msg.senderId,
          message: msg.message,
        });
        break;
    }
  }

  public sendToUser(userId: string, message: any) {
    this.room.broadCastInRoom(`user:${userId}`, message);
  }

  public sendToVendor(vendorId: string, message: any) {
    this.room.broadCastInRoom(`vendor:${vendorId}`, message);
  }

  public async clearChatRoom(chatId: string) {
    this.room.claerChat(`chat:${chatId}`);
    await this.chat.deleteChat(`chat:${chatId}`);
  }
}
