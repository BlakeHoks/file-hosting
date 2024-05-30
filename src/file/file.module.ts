import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '/data'),
      serveRoot: '/data',
    }),
  ],
})
export class FileModule {}
