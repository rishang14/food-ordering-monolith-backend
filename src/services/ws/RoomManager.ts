
export class RoomManager {
  private rooms: Map<string, Set<any>> = new Map();
  // add user to the room
  public joinRoom(roomid: string, socket: any) {
    // if room id isn't present add it
    if (!this.rooms.has(roomid)) {
      this.rooms.set(roomid, new Set());
    }
    this.rooms.get(roomid)?.add(socket);
    console.log("Currently in room ",this.rooms.size);
  }
 
  //send everyone the message available in the room
  public broadCastInRoom(roomid: string, message: any) {
    const clients = this.rooms.get(roomid);

    if (!clients) return;

    const data = JSON.stringify(message);

    clients.forEach((socket) => {
      try {
        socket.send(data); 
        console.log("hello i got the dataa",)
      } catch (error) {
        console.log(`Ws error`, error);
      }
    });
  }
 
  //clear the room 
  public clearRoom() {
    this.rooms.clear();
    console.log("Room is cleared");
  }

  //clear unused socket Connection
  public clearConnection(roomId: string, socket: any) {
    const clients = this.rooms.get(roomId);
    if (!clients) return;
    clients.delete(socket);
    if (clients.size == 0) {
      this.claerUserFromRoom(roomId);
    }
  }

  // romove from the room
  public claerUserFromRoom(roomid: string) {
    if (this.rooms.has(roomid)) {
      this.rooms.delete(roomid);
      console.log("room cleared");
    }
  }
}
