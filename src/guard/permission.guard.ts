import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {

  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    if(!request.user) {
      // 前面login.guard如果需要登录，并且登录成功后，会给request添加user对象
      // 如果request.user不存在，说明不需要登录，这里也不用判断权限，直接放行
      return true;
    }

    const permissions = request.user.permissions;

    const requiredPermissions = this.reflector.getAllAndOverride('require-permission', [
      context.getHandler(),
      context.getClass()
    ]);

    if(!requiredPermissions) {
      // 没有设置权限，直接放行
      return true;
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i];
      const found = permissions.find(item => item.code === curPermission);

      if(!found) {
        throw new UnauthorizedException('您没有访问该接口权限')
      }
      return true;
    }
    
    return true;
  }
}
