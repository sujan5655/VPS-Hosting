import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "jobs",
  timestamps: true,
  paranoid: true
})
export class Job extends Model {
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
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  requirements?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  company!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  location!: string;

  @Column({
    type: DataType.ENUM('remote', 'hybrid', 'onsite'),
    defaultValue: 'onsite',
  })
  workType!: string;

  @Column({
    type: DataType.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    defaultValue: 'full-time',
  })
  employmentType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  salary?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  salaryRange?: string;

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  benefits!: string[];

  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  skills!: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  experienceLevel?: string;

  @Column({
    type: DataType.ENUM('active', 'closed', 'draft'),
    defaultValue: 'active',
  })
  status!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  applicationDeadline?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  views!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  applications!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User, 'userId')
  poster!: User;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;
}
