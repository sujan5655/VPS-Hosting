import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { UserRole } from "./UserRole.js";
import { Permission } from "./Permission.js";
import { RolePermission } from "./RolePermission.js";

@Table({
  tableName: "roles",
  timestamps: true,
})
export class Role extends Model {
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
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  // Associations moved to associations.ts to avoid circular imports


}
