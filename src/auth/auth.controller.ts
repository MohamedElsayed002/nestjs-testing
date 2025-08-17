import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from './schema/auth.schema';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  async registerUser(@Body() createUser: CreateUserDto) : Promise<Auth> {
    return this.authService.registerUser(createUser)
  }

  @Post('login')
  async loginUser(@Body() loginUser: CreateUserDto) : Promise<{access_token : string}> {
    return this.authService.loginUser(loginUser)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    console.log(req)
    return this.authService.getCurrentUser(req.user.id)
  }
}
