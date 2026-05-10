import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import { Cart } from "./Cart.js";
import { Product } from "../models/ProductModel.js";

@Table({
  tableName: "cart_items",
  timestamps: true,
})
export class CartItem extends Model {

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare cartId: string;

  @BelongsTo(() => Cart)
  declare cart: Cart;

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
    defaultValue: 1,
  })
  declare quantity: number;

  // 🔥 snapshot price
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