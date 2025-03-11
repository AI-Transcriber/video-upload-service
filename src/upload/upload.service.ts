import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket_name_upload : string
  
  constructor(private readonly configService: ConfigService) {
    const bucket_region = this.configService.get<string>('bucket_region') ??'';
    this.bucket_name_upload = this.configService.get<string>('bucket_name_upload') ??'';
    const backblaze_endpoint = this.configService.get<string>('backblaze_endpoint') ??'';
    const aws_access_key_id = this.configService.get<string>('aws_access_key_id') ??'';
    const aws_secret_access_key = this.configService.get<string>('aws_secret_access_key') ??'';

    this.s3 = new S3Client({
      region: bucket_region,
      endpoint: backblaze_endpoint,
      credentials: {
        accessKeyId: aws_access_key_id,
        secretAccessKey: aws_secret_access_key,
      },
    });
  }

  async backBlazeBucket(keyName: string, fileBuffer: any, mimeType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket:this.bucket_name_upload,
        Key: keyName,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3.send(command);
      return { message: 'File uploaded successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrio un error al subir el archivo',
      );
    }
  }
}
