import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;
  
  /**
   * get
   * @param key string
   */
  async get(key: string) {
    return await this.redisClient.get(key);
  }
  /**
   * set
   * @param key 
   * @param value 
   * @param ttl 过期时间
   */
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if(ttl) {
      // 设定过期时间
      await this.redisClient.expire(key, ttl);
    }
  }
}
