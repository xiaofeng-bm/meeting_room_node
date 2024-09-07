import { Body, Controller, Get, Inject, Post, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {


  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('init-data')
  async initData() {
    await this.userService.init();
    return '初始化完成';
  }

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
  async login(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    vo.access_token = this.jwtService.sign({
      username: vo.userInfo.username,
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    })

    vo.refresh_token = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    })
    return vo;
  }

  @Get('refresh_token')
  async refresh(@Query('refresh_token') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      if(!data.userId) {
        throw new UnauthorizedException('refresh_token失效，请重新登录');
      }

      const user = await this.userService.findUserById(data.userId);
      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
      }, {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
      });

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
      })

      return {
        access_token,
        refresh_token
      }
    } catch (error) {
      throw new UnauthorizedException('refresh_token失效，请重新登录');
    }
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
