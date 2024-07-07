import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private readonly rooms = new Map<string, Set<string>>(); // Map to store chat rooms and clients

  constructor(
    private rabbitmqService: RabbitmqService,
    private redisService: RedisService,
  ) {}

  afterInit(server: Server) {
    this.rabbitmqService.consumeFromQueue((msg) => {
      const message = JSON.parse(msg.content.toString());
      this.handleReceivedMessage(message); // Handle received messages from RabbitMQ
    });
  }

  handleConnection(client: Socket) {
    const chatRoomId = client.handshake.query.chatRoomId as string;
    this.logger.log(`Client connected: ${client.id} to chat room ${chatRoomId}`);

    // Join the client to the specified chat room
    client.join(chatRoomId);

    // Track client in the chat room
    if (!this.rooms.has(chatRoomId)) {
      this.rooms.set(chatRoomId, new Set());
    }
    this.rooms.get(chatRoomId).add(client.id);
  }

  handleDisconnect(client: Socket) {
    const chatRoomId = client.handshake.query.chatRoomId as string;
    this.logger.log(`Client disconnected: ${client.id} from chat room ${chatRoomId}`);

    // Remove client from the chat room
    if (this.rooms.has(chatRoomId)) {
      this.rooms.get(chatRoomId).delete(client.id);
      if (this.rooms.get(chatRoomId).size === 0) {
        this.rooms.delete(chatRoomId);
      }
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    const chatRoomId = payload?.chatRoomId;
    this.logger.log(`Message received from ${client.id} in chat room ${chatRoomId}: ${payload?.content}`);

    // Store message in Redis or perform other operations
    await this.redisService.addMessageToRoom(chatRoomId, payload);

    // Broadcast the message to all clients in the chat room
    this.server.to(chatRoomId).emit('message', { content: payload.content });
  }

  private async handleReceivedMessage(message: any) {
    const chatRoomId = message.chatRoomId;
    this.logger.log(`Message received from RabbitMQ in chat room ${chatRoomId}: ${JSON.stringify(message)}`);

    // Broadcast the message to all clients in the chat room
    this.server.to(chatRoomId).emit('message', { content: message.content });
  }
}
