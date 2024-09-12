import { Controller, Get, Req, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import { RequireLogin, RequirePermission } from './decorator/custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('path')
  path() {
    return path.join(__dirname, '.env')
  }

  @Get('aaa')
  @RequireLogin()
  @RequirePermission([2])
  aaa() {
    return 'aaa'
  }

  @Get('bbb')
  bbb() {
    return 'bbb'
  }
}
