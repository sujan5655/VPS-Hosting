import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "posts",
  timestamps: true,
  paranoid: true // Soft deletes
})
export class Post extends Model {
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
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  })
  declare status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare summary?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  declare tags: string[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare likes: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare views: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User, 'userId')
  declare author: User;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare images: Array<{
    url: string;
    publicId: string;
    alt: string;
    order: number;
  }>;


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;
}
