import { Module } from '@nestjs/common';
import { UploadService } from './upload/upload.service';
import { UploadController } from './upload/upload.controller';
import { UploadModule } from './upload/upload.module';


@Module({
  imports: [UploadModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}
