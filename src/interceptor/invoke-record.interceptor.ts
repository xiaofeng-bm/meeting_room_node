/*
 * @Author: baimin min.bai@bondee.com
 * @LastEditors: baimin min.bai@bondee.com
 * @Description: 接口记录，用于记录接口调用的信息，相应内容，耗时等
 */
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);
  

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}
