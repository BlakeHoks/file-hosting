import {
  Injectable,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import * as process from 'process'
import { v1 as uuidv1 } from 'uuid'
import { JwtService } from '@nestjs/jwt'

const ru = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  є: 'e',
  ё: 'e',
  ж: 'j',
  з: 'z',
  и: 'i',
  ї: 'yi',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ы: 'y',
  э: 'e',
  ю: 'u',
  я: 'ya',
  ъ: '',
  ь: '',
}

export function rusToLatin(str: string) {
  return Array.from(str).reduce((acc, letter) => {
    const lowLetter = letter.toLowerCase()
    const en = ru[lowLetter] ?? letter
    const enNormalized = lowLetter === letter ? en : en.toUpperCase()
    return acc + enNormalized
  }, '')
}

@Injectable()
export class FileService {
  constructor(private jwtService: JwtService) {}

  ycUrl = 'https://bbarq02f94d2k83fauvr.containers.yandexcloud.net'
  localUrl = 'http://localhost:8080'
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET
  client = new S3Client({
    endpoint: 'https://storage.yandexcloud.net',
    region: 'ru-central1',
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    },
  })

  async getFiles(filePath: string) {
    const getCommand = new GetObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: `${filePath}`,
    })
    try {
      const response = await this.client.send(getCommand)
      const newFileName = rusToLatin(
        filePath.split('/').pop().replaceAll(' ', '_'),
      )
      return new StreamableFile(await response.Body.transformToByteArray(), {
        type: response.ContentType,
        disposition: `attachment; filename=${newFileName}`,
      })
    } catch (error) {
      return { Error: 'The specified file does not exist.' }
    }
  }

  async getFilesAndDelete(filePath: string) {
    const getCommand = new GetObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: `${filePath}`,
    })
    try {
      const response = await this.client.send(getCommand)
      const newFileName = rusToLatin(
        filePath.split('/').pop().replaceAll(' ', '_'),
      )
      const delCommand = new DeleteObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: `${filePath}`,
      })
      await this.client.send(delCommand)
      return new StreamableFile(await response.Body.transformToByteArray(), {
        type: response.ContentType,
        disposition: `attachment; filename=${newFileName}`,
      })
    } catch (error) {
      return { Error: 'The specified file does not exist.' }
    }
  }

  async saveFiles(files: Express.Multer.File[], token: any) {
    let path: string
    if (!token) {
      throw new UnauthorizedException()
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      const newFileName = rusToLatin(files[0].originalname.replaceAll(' ', '_'))
      path = `${payload.id}/${newFileName}`
    } catch {
      throw new UnauthorizedException()
    }
    const uploadCommand = new PutObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: path,
      Body: files[0].buffer,
      ContentType: files[0].mimetype,
    })
    await this.client.send(uploadCommand)
    return `${this.ycUrl}/file?filePath=${path}`
  }

  async saveFilesOneTime(files: Express.Multer.File[], token?: string) {
    let path: string
    const newFileName = rusToLatin(files[0].originalname.replaceAll(' ', '_'))
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        })
        path = `${payload.id}/${newFileName}`
      } catch {
        throw new UnauthorizedException()
      }
    } else {
      path = `${uuidv1()}/${newFileName}`
    }
    const uploadCommand = new PutObjectCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: path,
      Body: files[0].buffer,
      ContentType: files[0].mimetype,
    })
    await this.client.send(uploadCommand)
    return `${this.ycUrl}/file/getAndDelete?filePath=${path}`
  }
}
