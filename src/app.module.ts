import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { ChatGateway } from './chat/chat.gateway';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { RedisService } from './redis/redis.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [RabbitmqModule, RedisModule,  ConfigModule.forRoot({
      isGlobal: true,
    }),],
  controllers: [AppController],
  providers: [AppService, ChatGateway, RabbitmqService, RedisService],
})
export class AppModule {}