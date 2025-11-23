import type { CreateOrderInput } from "../dto/Order.dto.ts";
import {
  Vendor,
  type VendorDoc,
  Order,
  type OrderDoc,
  type FoodsType,
  Customer,
  Foods,
} from "../models/index.ts";
import { Customercart } from "./Cart.service.ts";

export interface foodItems {
  food: string;
  unit: number;
}

export interface foodwithQuantity {
  food: FoodsType;
  unit: number;
}

export class CustomerOrder extends Customercart {
  private static async calcFoodPrice(
    foods: FoodsType[],
    items: foodItems[]
  ): Promise<number> {
    // unit should be greator than zero and should be there
    for (const i of items) {
      if (!i.unit || i.unit < 0) {
        throw new Error("Unit Should be greater than 0");
      }
    }

    // all the food will be from the same vendor
    const vendorId = foods[0]?.vendorId.toString();
    for (const food of foods) {
      if (food.vendorId.toString() !== vendorId) {
        throw new Error("All items must be from the same vendor");
      }
    }
    // generate the price
    let totalPrice = 0;
    for (const i of items) {
      const db = foods.find((f: any) => f._id.toString() == i.food);
      totalPrice += (db?.price as number) * i.unit;
    }

    return totalPrice;
  }

  private static async getAndCheckFoodValid(
    item: foodItems[]
  ): Promise<FoodsType[]> {
    const foodIds = item.map((i) => i.food);
    const foods: FoodsType[] = await Foods.find({ _id: { $in: foodIds } });
    if (foods.length !== foodIds.length) {
      throw new Error("Some Food ids are wrong");
    }
    return foods;
  }

  static async generateOrder(order: CreateOrderInput):Promise<OrderDoc> {
    const food = await this.getAndCheckFoodValid(order.items);
    const price = await this.calcFoodPrice(food, order.items);
    const expiry = new Date(new Date().getTime() + 60 * 1000); // 1 min later
    const vendorId = food[0]?.vendorId;
    const createdOrder = await Order.create({
      userId: order.userId,
      vendorId: vendorId,
      totalAmount: price,
      orderStatus: "Created",
      items: order.items,
      expiresAT: expiry,
    });
    if (!createdOrder)
      throw new Error("Something went wrong while Creating the order");

    await Customer.findOneAndUpdate(
      {
        _id: order.userId,
      },
      { $push: { orders: createdOrder._id } }
    );

    await Vendor.findOneAndUpdate(
      {
        _id: vendorId,
      },
      { $push: { orders: createdOrder._id } }
    );
    return createdOrder;
  }

  static async cancelOrder(orderId: string): Promise<OrderDoc> {
    this.validId(orderId);
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { orderStatus: "Canceled", cancelledAt: new Date() }
    );
    if (!order) {
      throw new Error("Something went Wrong while canceling the order");
    }

    return order;
  }
}
