import {
  Controller,
  UploadedFile,
  Post,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('video')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.uploadService.backBlazeBucket(
      file.originalname,
      file.buffer,
      file.mimetype,
    );
  }
}
