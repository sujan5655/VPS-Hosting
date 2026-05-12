import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "connections",
  timestamps: true,
  paranoid: true
})
export class Connection extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
    defaultValue: 'pending',
  })
  status!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  requesterId!: string;

  @BelongsTo(() => User, 'requesterId')
  requester!: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  recipientId!: string;

  @BelongsTo(() => User, 'recipientId')
  recipient!: User;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  connectedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;
}
