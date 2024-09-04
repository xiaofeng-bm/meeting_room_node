import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  @Inject(UserService)
  private readonly userService: UserService;

  @Post('register')
  register(@Body() registerUser: any) {

    return 'success'
  }
}
