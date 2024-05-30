import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { hash, verify } from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { authModel } from './auth.model'
import * as process from 'process'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async logIn(authData: authModel): Promise<any> {
    const user = await this.userService.findByEmail(authData.email)
    const isValidPassword = await verify(user.password, authData.password)
    if (user && isValidPassword) {
      const payload = { id: user.id, email: user.email }
      return {
        access_token: await this.jwtService.signAsync(payload),
      }
    } else {
      throw new UnauthorizedException()
    }
  }

  async register(authData: authModel): Promise<any> {
    const isExist = await this.userService.findByEmail(authData.email)
    if (isExist) {
      throw new Error('User already exists')
    }
    const user = await this.userService.create({
      email: authData.email,
      password: await hash(authData.password),
    })
    const payload = { id: user.id, email: authData.email }
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}
