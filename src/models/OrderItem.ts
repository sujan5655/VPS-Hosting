import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import { Order } from "./Order.js";
import { Product } from "../models/ProductModel.js";

@Table({
  tableName: "order_items",
  timestamps: true,
})
export class OrderItem extends Model {

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare orderId: string;

  @BelongsTo(() => Order)
  declare order: Order;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  // 💰 snapshot price
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  // optional selected size
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare size: string;
}