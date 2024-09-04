import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 添加全局参数校验管道
  app.useGlobalPipes(new ValidationPipe());

  // 获取.env配置文件
  const configService = app.get(ConfigService);

  await app.listen(configService.get('nest_server_port'));
}
bootstrap();
