import { Module } from '@nestjs/common';
import { UploadService } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UploadModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
