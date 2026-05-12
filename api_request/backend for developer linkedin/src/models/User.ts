import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasOne,
} from "sequelize-typescript";
import { Role } from "./Role";
import { UserRole } from "./UserRole";
import { Profile } from "./Profile";
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
    allowNull: false,
    unique: true,
  })
  declare email: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;
  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];

  /** Public CV-style info (used when showing connections, etc.) */
  @HasOne(() => Profile)
  declare profile?: Profile;
}
export default User;
