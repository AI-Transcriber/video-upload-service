import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand,GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket_name_upload : string
  private readonly bucket_name_extract_audio : string
  constructor(private readonly configService: ConfigService) {
    const bucket_region = this.configService.get<string>('bucket_region') ??'';
    this.bucket_name_upload = this.configService.get<string>('bucket_name_upload') ??'';
    this.bucket_name_extract_audio = this.configService.get<string>('bucket_name_extract_audio') ??'';
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

     const date = Date.now();
     const formattedDate = date
     const formattedName = `${formattedDate} ${keyName}`

    try {

      const command = new PutObjectCommand({
        Bucket: this.bucket_name_upload,
        Key: formattedName,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3.send(command);
      return this.extractAudio(formattedName);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrio un error al subir el archivo',
      );
    }
  }

 async extractAudio(keyName: string): Promise<object> {
  try {
    const command = new GetObjectCommand({
      Bucket: this.bucket_name_upload,
      Key: keyName,
    });

    const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  
    return this.processAudioExtraction(signedUrl,keyName);
  } catch (error) {
    console.log(error)
    throw new InternalServerErrorException('Ocurrio un error al extraer el audio');
  }
}

private async processAudioExtraction(signedUrl: string,keyName: string): Promise<object> {

    try {
      const response = await axios({
        method: 'get',
        url: signedUrl,
        responseType: 'stream',
      })
  
      ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe');
      
      const audioStream = ffmpeg(response.data)
        .format('mp3')
        .audioCodec('libmp3lame')
        .pipe()
          
        
       return await this.uploadAudioToBackBlaze(audioStream, keyName);
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Ocurrio un error al extraer el audio');
    }


}
  async uploadAudioToBackBlaze(audioStream:any, keyName: string): Promise<object> {
    try {
      const upload = new Upload({
        client: this.s3, 
        params: {
          Bucket: this.bucket_name_extract_audio,
          Key: keyName, 
          Body: audioStream,
          ContentType: 'audio/mpeg', 
        },
      });
      return await upload.done()
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Ocurrio un error al subir el audio');
    }
  
  }



}
