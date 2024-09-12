import { Body, Controller, Get, Inject, Post, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenUsers } from './vo/login-user.vo';
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator';
import { UserDetailVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-password.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {


  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Get('init-data')
  async initData() {
    await this.userService.init();
    return '初始化完成';
  }


  tokenSign(tokenType: 'access_token' | 'refresh_token', user: TokenUsers) {
    if (tokenType === 'access_token') {
      return this.jwtService.sign({
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      }, {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
      })
    } else {
      return this.jwtService.sign({
        userId: user.id
      }, {
        expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
      })
    }
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
    vo.access_token = this.tokenSign('access_token', vo.userInfo);

    vo.refresh_token = this.tokenSign('refresh_token', vo.userInfo);
    return vo;
  }

  @Get('refresh_token')
  async refresh(@Query('refresh_token') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      if (!data.userId) {
        throw new UnauthorizedException('refresh_token失效，请重新登录');
      }

      const user = await this.userService.findUserById(data.userId);
      const access_token = this.tokenSign('access_token', user);

      const refresh_token = this.tokenSign('refresh_token', user);

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
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    const res = await this.userService.updatePassword(passwordDto);

    // 删除redis中的验证码
    this.redisService.del(`update_password_captcha_${passwordDto.email}`);

    return res;
  }

  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '验证码',
      html: `<p>您正在修改密码，验证码为${code}</p>`
    })

    return '发送成功'
  }

  @Get('list')
  getList() {
    // todu
  }

  @Get('freeze')
  freeze() {
    // toduv
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName;
    vo.email = user.email;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.isFrozen = user.isFrozen;
    vo.createTime = user.createTime;
    return vo;
  }
}
