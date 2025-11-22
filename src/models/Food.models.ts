import mongoose, { Document, Schema, Types } from "mongoose";

export interface FoodsType extends Document {
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  category: "Veg" | "Non-Veg";
  foodType: string;
  readyTime?: number;
  price: number;
  rating: number;
  images?: [string];
}

const FoodSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "vendor",
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["Veg", "Non-Veg"], required: true },
    foodType: { type: String, required: true },
    readyTime: { type: Number },
    price: { type: Number },
    rating: { type: Number },
    images: { type: [String] },
  },
  {
    timestamps: true,
  }
);

const Foods = mongoose.model<FoodsType>("food", FoodSchema);

export { Foods };
