import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getHello() {
    return 'hello wrold'
  }
}
