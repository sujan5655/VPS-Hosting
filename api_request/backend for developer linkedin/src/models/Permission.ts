import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { RolePermission } from "./RolePermission";
import { Role } from "./Role";

@Table({
  tableName: "permissions",
  timestamps: true,
})
export class Permission extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description: string;
  @Column({
    type:DataType.STRING,
    allowNull:false
  })
  declare resource:string
  @Column({
    type:DataType.STRING,
    allowNull:false
  })
  declare action:string
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;
  
@BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];

  @HasMany(() => RolePermission)
  declare rolePermissions: RolePermission[];
}
export default Permission
