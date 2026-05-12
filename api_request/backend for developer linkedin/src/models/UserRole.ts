
import { Table,Column,DataType,Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";
import { Role } from "./Role";
@Table({
  tableName:"user_roles",
  timestamps:true,
})
export class UserRole extends Model{
  @ForeignKey(()=>User)
  @Column({
    type:DataType.UUID,
    allowNull:false
  })
  declare userId:string
  @ForeignKey(()=>Role)
  @Column({
    type:DataType.UUID,
    allowNull:false
  })
  declare roleId:string;
  @BelongsTo(()=>User)
  declare user:User
  @BelongsTo(()=>Role)
  declare role:Role
}
export default UserRole
