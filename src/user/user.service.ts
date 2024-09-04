import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils/index'
import { EmailService } from 'src/email/email.service';


@Injectable()
export class UserService {
  private logger = new Logger();

  // 注入数据库对象
  @InjectRepository(User)
  private userRepository: Repository<User>;

  // 注入redis
  @Inject(RedisService)
  private redisService: RedisService;

  // 注入邮件服务
  @Inject(EmailService)
  private emailService: EmailService;

  /**
   * 注册
   * @param user 
   * @returns 
   */
  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException("验证码错误", HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username
    })

    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }
  /**
   * 获取验证码
   * @param email string
   */
  async getCaptcha(email: string) {
    const code = Math.random().toString().slice(2, 8);

    // 将验证码存入redis，5分钟有效期
    await this.redisService.set(`captcha_${email}`, code, 60 * 5)

    await this.emailService.sendMail({
      to: 'baimin_job@163.com',
      subject: '验证码',
      html: `<p>您正在注册，验证码为${code}，5分钟内有效</p>`
    })
    return '发送成功'
  }
}
