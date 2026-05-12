import { Table,Model,Column,DataType, ForeignKey, AllowNull, BelongsTo } from "sequelize-typescript";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Table({
  tableName:"role_permissions",
  timestamps:true
})

export class RolePermission extends Model{
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  declare id: string
  
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare roleId: string
  @ForeignKey(() => Permission)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare permissionId: string

  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => Permission)
  declare permission: Permission;
}
export default RolePermission