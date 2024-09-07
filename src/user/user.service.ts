import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { md5 } from 'src/utils/index'
import { EmailService } from 'src/email/email.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';


@Injectable()
export class UserService {
  private logger = new Logger();


  /**
   * 注入User实体
   */
  @InjectRepository(User)
  private userRepository: Repository<User>;
  /**
   * 注入role实体
   */
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;
  /**
   * 注入permission实体
   */
  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  // 注入redis
  @Inject(RedisService)
  private redisService: RedisService;

  // 注入邮件服务
  @Inject(EmailService)
  private emailService: EmailService;

  /**
   * 初始化
   */
  async init() {
    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.password = md5('123456');
    adminUser.email = 'baimin_job@163.com';
    adminUser.nickName = 'admin';
    adminUser.isAdmin = true;
    adminUser.phoneNumber = '17695974184';


    const zhangsan = new User();
    zhangsan.username = '张三';
    zhangsan.password = md5('123456');
    zhangsan.email = 'xiaofengbm@gmail.com';
    zhangsan.nickName = '张三';

    const adminRole = new Role();
    adminRole.name = '超级管理员';

    const role = new Role();
    role.name = '普通用户';

    const adminPermission = new Permission();
    adminPermission.code = 1;
    adminPermission.description = '超级管理员权限';

    const permission = new Permission();
    permission.code = 2;
    permission.description = '普通用户权限';

    // 用户-角色
    adminUser.roles = [adminRole];
    zhangsan.roles = [role];

    // 角色-权限
    adminRole.permissions = [adminPermission];
    role.permissions = [permission];


    await this.permissionRepository.save([adminPermission, permission]);
    await this.roleRepository.save([adminRole, role]);
    await this.userRepository.save([adminUser, zhangsan]);
  }

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
      to: email, // 收件人邮箱
      subject: '验证码', // 邮箱主题
      html: `<p>您正在注册，验证码为${code}，5分钟内有效</p>`
    })
    return '发送成功'
  }

  /**
   * 登录
   * @param loginUser LoginUserDto
   */
  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    // findOne({ where: id: null })会返回第一条数据，要么判空在用，要么用下面方法替代。
    // const user = await this.userRepository.createQueryBuilder().where({ username: loginUser.username }).relations(['roles']).getOne();
    const user = loginUser.username ? await this.userRepository.findOne({
      where: {
        username: loginUser.username
      },
      relations: ['roles', 'roles.permissions']
    }) : null;

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }


    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      password: user.password,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime.getTime(),
      roles: user.roles.map(role => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach(permission => {
          if(arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        })
        return arr;
      }, [])
    }
    return vo;
  }
  /**
   * id => user
   * @param id number
   */
  async findUserById(id: number) {
    const user = id ? await this.userRepository.findOne({
      where: {
        id
      }
    }) : null;
    return user;
  }
}
