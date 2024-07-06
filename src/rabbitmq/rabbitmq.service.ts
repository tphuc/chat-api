// src/rabbitmq/rabbitmq.service.ts
import { Injectable } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper, connect } from 'amqp-connection-manager';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService {
  private connection: AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor() {
    this.connection = connect(['amqp://localhost']);
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: amqp.Channel) =>
        channel.assertQueue('chat_queue', { durable: true }),
    });
  }

  async sendToQueue(message: any) {
    await this.channelWrapper.sendToQueue('chat_queue', message);
  }

  async consumeFromQueue(callback: (msg: amqp.Message) => void) {
    await this.channelWrapper.addSetup((channel: amqp.Channel) => {
      return channel.consume('chat_queue', callback, { noAck: true });
    });
  }
}
