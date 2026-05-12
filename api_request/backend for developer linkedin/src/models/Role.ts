import { Table,Model,DataType,Column, BelongsToMany } from "sequelize-typescript";
import { User } from "./User";
import { UserRole } from "./UserRole";
import { Permission } from "./Permission";
import { RolePermission } from "./RolePermission";
@Table({
  tableName:"roles",
  timestamps:true
})
export class Role extends Model{
  @Column({
    type:DataType.STRING,
    defaultValue:DataType.UUIDV4,
    primaryKey:true,
  })
  declare id:string
@Column({
  type:DataType.STRING,
  allowNull:false,
})
declare name:string

@Column({
  type:DataType.STRING,
  allowNull:false
})
declare description:string

@Column({
  type:DataType.BOOLEAN,
  defaultValue:true
})
declare isActive:boolean;

@BelongsToMany(()=>User,()=>UserRole)
declare users:User[];

@BelongsToMany(() => Permission, () => RolePermission)
declare permissions: Permission[];
}
export default Role