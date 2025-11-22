import type { CreateOrderInput } from "../dto/Order.dto.ts";
import {
  Vendor,
  type VendorDoc,
  Order,
  type OrderDoc,
  type FoodsType,
} from "../models/index.ts";
import { Customercart } from "./Cart.service.ts";

export interface foodItems {
  food: string,
  unit: number,
}

export interface foodwithQuantity {
  food: FoodsType,
  unit: number,
}
export class CustomerOrder extends Customercart {
  private static async calcFoodPrice(
    data: foodItems[],
    foods: FoodsType[]
  ): Promise<number> {
    // got the foods compare with the fooditem array is anyid is wrong or doesn't match with the vendor food return and throw error
    // that provided food id is wrong
    let totalPrice = 0;
    const food: foodwithQuantity[] = [];
    for (const item of data) {
      this.validId(item.food);
      const getFood = await this.foodExist(item.food);
      food.push({ food: getFood, unit: item.unit });
    }
    for (const f of food) {
      totalPrice += f.food.price * f.unit;
    }
    return totalPrice;
  }

  private static async vendorExistWithFoods(id: string) {
    this.validId(id);
    const vendor: any = await Vendor.findById(id).populate("foods");
    if (!vendor) {
      throw new Error("No vendor Exist");
    }
    return vendor?.foods;
  }

  static async generateOrder(order:CreateOrderInput): Promise<OrderDoc> {
    const food = await this.vendorExistWithFoods(order.vendorId);
    const price = await this.calcFoodPrice(order.items, food);
    const expiry = new Date(new Date().getTime() + 60 * 1000); // 1 min later
    const createdOrder = await Order.create({
      userId: order.userId,
      vendorId: order.vendorId,
      totalAmount: price,
      orderStatus: "Created",
      items: order.items,
      expiresAT: expiry,
    });
    if (!createdOrder)
      throw new Error("Something went wrong while Creating the order");
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
