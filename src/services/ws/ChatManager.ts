import { redisIntance } from "../../services/redis.client.ts";

export class ChatManager {
  public async addMessage(chatId: string, senderId: string, message: any) {
    await redisIntance.XADD(`chat:${chatId}`, "*", {
      senderId,
      message,
    });
  }

  public async getChatHistory(chatId: string) {
    const entries = await redisIntance.XRANGE(`chat:${chatId}`, "-", "+");

    if (!entries) {
      return [];
    }
    return entries.map((item) => ({
      id: item.id,
      senderId: item.message.senderId,
      message: item.message.message,
    }));
  }

  public async deleteChat(chatId: string) {
    await redisIntance.del(`chat:${chatId}`)
  }
}
