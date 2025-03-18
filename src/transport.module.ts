import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'VIDEO_UPLOAD_SERVICE',
        useFactory: async (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('rabbitmq_url') ??'amqp://localhost:5672';
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'video-upload-queue',
              queueOptions: {
                durable: false,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [],
  exports: [ClientsModule.registerAsync([
    {
      name: 'VIDEO_UPLOAD_SERVICE',
      useFactory: async (configService: ConfigService) => {
        const rabbitmqUrl = configService.get<string>('rabbitmq_url') ??'amqp://localhost:5672';
        return {
          transport: Transport.RMQ,
          options: {
            urls: [rabbitmqUrl],
            queue: 'video-upload-queue',
            queueOptions: {
              durable: false,
            },
          },
        };
      },
      inject: [ConfigService],
    },
  ]),],
})
export class TransportModule {}
