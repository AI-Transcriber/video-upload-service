import { Module } from '@nestjs/common';
import { TransportModule } from 'src/transport.module';

@Module({
    imports:[TransportModule]
})
export class UploadModule {}
