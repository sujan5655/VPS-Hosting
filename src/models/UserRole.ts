import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User.js";
import { Role } from "./Role.js";

@Table({
  tableName: "user_roles",
  timestamps: true,
})
export class UserRole extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare roleId: string;

  // Associations moved to associations.ts to avoid circular imports
}
