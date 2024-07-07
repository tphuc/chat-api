import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');

    this.logger.log(`Initializing Redis with host: ${host} and port: ${port}`);

    this.client = new Redis({
      host,
      port,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  async addMessageToRoom(roomId: string, message: any) {
    await this.client.rpush(`chatroom:${roomId}:messages`, JSON.stringify(message));
  }

  async getMessagesFromRoom(roomId: string, start = 0, end = -1) {
    const data = await this.client.lrange(`chatroom:${roomId}:messages`, start, end);
    return data.map((item) => JSON.parse(item));
  }
}
