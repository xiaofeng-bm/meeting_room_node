export interface UserInfo {
  id: number;
  username: string;
  password: string;
  nickName: string;
  email: string;
  headPic: string;
  phoneNumber: string;
  isFrozen: boolean;
  isAdmin: boolean;
  createTime: number;
  roles: string[];
  permissions: string[];
}

export type TokenUsers =  Pick<UserInfo, 'id' | 'username' | 'roles' | 'permissions'>

export class LoginUserVo {
  userInfo: UserInfo;
  access_token: string;
  refresh_token: string;
}