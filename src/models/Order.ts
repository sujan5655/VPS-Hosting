import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";

import { User } from "./User.js";
import { OrderItem } from "./OrderItem.js";

@Table({
  tableName: "orders",
  timestamps: true,
})
export class Order extends Model {

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

  @BelongsTo(() => User)
  declare user: User;

  // 💰 final total
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  declare totalAmount: number;

  // 📦 order status
  @Column({
    type: DataType.ENUM(
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ),
    defaultValue: "pending",
  })
  declare status: string;

  // 💳 payment status
  @Column({
    type: DataType.ENUM(
      "pending",
      "paid",
      "failed"
    ),
    defaultValue: "pending",
  })
  declare paymentStatus: string;

  // 🚚 shipping address
  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    street: string;
  };

  @HasMany(() => OrderItem)
  declare items: OrderItem[];
}