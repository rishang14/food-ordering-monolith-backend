import mongoose from "mongoose";
import { Customer } from "../models/User.models.ts";
import { Foods} from "../models/Food.models.ts";

export interface AddToCartDTO {
  userId: string;
  foodId: string;
  unit: number;
}

export interface UpdateCartDTO {
  userId: string;
  foodId: string;
  unit: number;
}

export interface RemoveCartDTO {
  userId: string;
  foodId: string;
}

export interface ClearCartDTO {
  userId: string;
}

export class Customercart {
  private static validID(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Id");
    }
  }

  private static async foodExist(foodId: string) {
    this.validID(foodId);
    const foods = await Foods.findById(foodId);
    if (!foods) {
      throw new Error("Food with this Id is wrong");
    }
  }

  private static async populateFoodsInUser(userId: string) {
    this.validID(userId);
    const user = await Customer.findById(userId).populate("cart.food");
    if (!user) throw new Error("User not found");
    return user;
  }

  static async addtocart({ userId, foodId, unit }: AddToCartDTO) {
    await this.foodExist(foodId);
    const isInCart = await Customer.findOne({
      _id: userId,
      "cart.food": foodId,
    });

    if (isInCart) {
      await Customer.findOneAndUpdate(
        {
          _id: userId,
          "cart.food": foodId,
        },
        {
          $inc: { "cart.$.unit": unit },
        }
      );
    } else {
      await Customer.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: { food: foodId, unit },
          },
        },
        { new: true }
      );
    }

    return await this.populateFoodsInUser(userId);
  }
  static async updatCart(userid: string, foodId: string, unit: number) {
    await this.foodExist(foodId);

    if (unit < 0) {
      throw new Error("Unit should be equal or greator than zero");
    }

    const isInCart = await Customer.findOne({
      _id: userid,
      "cart.food": foodId,
    });

    if (!isInCart) {
      throw new Error("Item not found in the Cart");
    }

    if (unit == 0) {
      return await this.removeFromCart({ userId: userid, foodId });
    }

    await Customer.updateOne(
      { _id: userid, "cart.food": foodId },
      {
        $set: { "cart.$.unit": unit },
      }
    );

    return await this.populateFoodsInUser(userid);
  }

  static async removeFromCart({ userId, foodId }: RemoveCartDTO) {
    await this.foodExist(foodId);

    this.validID(userId);

    const foodIsInUserCart = await Customer.findOne({
      _id: userId,
      "cart.food": foodId,
    });

    if (!foodIsInUserCart) {
      throw new Error("Item not found in cart");
    }

    await Customer.updateOne(
      {
        _id: userId,
      },
      { $pull: { cart: { food: foodId } } }
    );

    return await this.populateFoodsInUser(userId);
  }

  static async clearCart({ userId }: ClearCartDTO) {
    this.validID(userId);

    await Customer.updateOne(
      {
        _id: userId,
      },
      { cart: [] }
    );

    return this.populateFoodsInUser(userId);
  }
}
