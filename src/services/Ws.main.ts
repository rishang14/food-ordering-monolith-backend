import { WebSocketServer } from "ws";

export class RealTime {
  public wss: WebSocketServer;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });

    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (socket) => {
      console.log("socket:", socket);
    });

    this.wss.on("headers", (headers) => {
      headers.push("Access-Control-Allow-Origin: *");
    });   

    this.wss.on("error",()=>{

    })
  }
}
