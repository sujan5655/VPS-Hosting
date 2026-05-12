import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "messages",
  timestamps: true,
  paranoid: true
})
export class Message extends Model {
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
  content!: string;

  @Column({
    type: DataType.ENUM('sent', 'delivered', 'read', 'deleted'),
    defaultValue: 'sent',
  })
  status!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  senderId!: string;

  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  recipientId!: string;

  @BelongsTo(() => User, 'recipientId')
  recipient!: User;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  conversationId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEdited!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  readAt?: Date;

  @Column({
    type: DataType.JSON,
    defaultValue: {},
  })
  attachments!: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;
}
