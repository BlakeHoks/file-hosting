import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileService } from './file.service'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/uploadOneTime')
  @ApiOperation({ summary: 'Upload file one time' })
  @ApiQuery({
    name: 'authToken',
    required: false,
    schema: {
      properties: {
        authToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({
    schema: {
      properties: {
        fileUrl: { type: 'string' },
      },
    },
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFileOneTime(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() query: any,
  ) {
    return this.fileService.saveFilesOneTime(files, query.authToken)
  }

  @Post()
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({
    schema: {
      properties: {
        fileUrl: { type: 'string' },
      },
    },
    status: HttpStatus.OK,
    description: 'Success',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({
    name: 'authToken',
    required: true,
    schema: {
      properties: {
        authToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() query: any,
  ) {
    return this.fileService.saveFiles(files, query.authToken)
  }

  @Get()
  @ApiOperation({ summary: 'Get file' })
  @ApiQuery({
    name: 'filePath',
    required: true,
    schema: {
      properties: {
        authToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
    status: HttpStatus.OK,
    description: 'Success',
  })
  @ApiProduces('multipart/mixed')
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async downloadFile(@Query() query: any) {
    return await this.fileService.getFiles(query.filePath as string)
  }

  @Get('/getAndDelete')
  @ApiOperation({ summary: 'Get file and delete' })
  @ApiQuery({
    name: 'filePath',
    required: true,
    schema: {
      properties: {
        authToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
    status: HttpStatus.OK,
    description: 'Success',
  })
  @ApiProduces('multipart/mixed')
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async downloadFileAndDelete(@Query() query: any) {
    return await this.fileService.getFilesAndDelete(query.filePath as string)
  }
}
