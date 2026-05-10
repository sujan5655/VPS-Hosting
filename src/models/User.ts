import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from "sequelize-typescript";
import { Role } from "./Role.js";
import { UserRole } from "./UserRole.js";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
  })
  declare password: string;

  // Associations moved to associations.ts to avoid circular imports
}