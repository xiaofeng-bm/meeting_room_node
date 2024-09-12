import { IsEmail, IsNotEmpty, MinLength } from "class-validator";


export class UpdateUserPasswordDto {
  @IsNotEmpty({
    message: '新密码不能为空'
  })
  @MinLength(6, {
    message: '密码长度不能小于6位'
  })
  password: string;

  @IsEmail({}, {
    message: '邮箱格式不正确'
  })
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空'
  })
  captcha: string;
}