import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "profiles",
  timestamps: true,
  paranoid: true
})
export class Profile extends Model {
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
  declare headline: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare summary?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare location?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare industry?: string;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare experience: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }>;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare skills: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare github?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare linkedin?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare twitter?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone?: string;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare profileImage: {
    url: string;
    alt: string;
  };

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare openToWork: boolean;

  @Column({
    type: DataType.JSON,
    defaultValue:[],
  })
  declare jobPreferences: {
    jobTypes: string[];
    locations: string[];
    industries: string[];
    remote: boolean;
  };

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User, 'userId')
  declare owner: User;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;
}
