/*
 * @Author: baimin min.bai@bondee.com
 * @LastEditors: baimin min.bai@bondee.com
 * @Description: 登录守卫
 */
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();


    const requireLogin = this.reflector.getAllAndOverride('require-login', [context.getHandler(), context.getClass()]);

    if(!requireLogin) {
      // 不需要验证登录
      return true;
    }

    // 获取jwt token
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('请先登录');
    }

    try {
      // Bearer xxxxx => xxxxx
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);
      request.user = {
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        permissions: data.permissions
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('token失效，请重新登录');
    }
    return true;
  }
}
