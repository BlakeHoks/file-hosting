import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { authModel } from './auth.model'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: authModel,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  logIn(@Body() regData: authModel) {
    return this.authService.logIn(regData)
  }
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success',
    type: authModel,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  register(@Body() regData: authModel) {
    return this.authService.register(regData)
  }
}
