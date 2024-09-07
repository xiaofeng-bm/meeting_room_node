import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'permissions'
})
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: '权限代码'
  })
  code: number;

  @Column({
    length: 100,
    comment: '权限描述'
  })
  description: string;
}