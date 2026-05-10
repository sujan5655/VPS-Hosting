import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./User.js";

@Table({
  tableName: "seller_applications",
  timestamps: true,
})
export class SellerApplication extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare businessName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare businessDescription: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  declare businessEmail: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare businessPhone?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare businessAddress?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare taxId?: string;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  })
  declare status: 'pending' | 'approved' | 'rejected';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare rejectionReason?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare reviewedBy?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare reviewedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;

  // Associations
  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user?: User;

  @BelongsTo(() => User, { foreignKey: 'reviewedBy', as: 'reviewer' })
  declare reviewer?: User;
}

export default SellerApplication;
