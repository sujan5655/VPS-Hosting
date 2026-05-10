import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Category } from "../models/CategoryModel.js";
import { User } from "./User.js";

@Table({ tableName: "products", timestamps: true })
export class Product extends Model {

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
  declare name: string;

  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare stock: number;

  // 🔥 FLEXIBLE IMAGE SYSTEM (ALL PRODUCTS)
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare images: {
    url: string;
    public_id: string;
    type?: string; // front, back, zoom, main, etc.
  }[];

  // optional sizes (for clothes only)
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare sizes: string[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

@Column({
  type: DataType.JSON,
})
declare attributes: {
  gender?: string;
  sizes?: string[];
  color?: string;
  brand?: string;
};

  // 🔗 Category relation
  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
  })
  declare categoryId: string;

  @BelongsTo(() => Category)
  declare category: Category;

  // 🔗 Owner (seller)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}