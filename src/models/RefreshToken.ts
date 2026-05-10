import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User.js";

@Table({
  tableName: "refresh_tokens",
  timestamps: true,
})
export class RefreshToken extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare token: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isRevoked: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare userAgent: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare ipAddress: string;
}
