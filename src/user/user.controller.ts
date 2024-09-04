import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('user')
export class UserController {


  @Inject(UserService)
  private readonly userService: UserService;

  /**
   * 注册
   * @param registerUser RegisterUserDto
   * @returns 
   */
  @Post('register')
  async register(@Body() user: RegisterUserDto) {

    return this.userService.register(user);
  }
  /**
   * 获取验证码
   */
  @Get("register-captcha")
  async catpcah(@Query('email') email: string) {
    return this.userService.getCaptcha(email);
  }

  @Post('login')
  login() {
    // denglu 
  }

  @Post("update")
  update() {
    // todu
  }

  @Post('update_password')
  updatePassword() {
    // todu
  }
  @Get('list')
  getList() {
    // todu
  }

  @Get('freeze')
  freeze() {
    // toduv
  }
}
