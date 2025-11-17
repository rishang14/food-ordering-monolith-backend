import mongoose, { Schema, Document } from "mongoose";
// import { OrderDoc } from './Order';

export interface CustomerDoc extends Document {
  email: string;
  password: string;
  name:string,
  address: string;
  phone: string;
  verified: boolean;
  otp: number | undefined;
  otp_expiry: Date | undefined;
  lat: number;
  lng: number;
  cart: [any];
  orders: [any];
}

const CustomerSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    name: { type: String,required:true },
    address: { type: String },
    phone: { type: String, required: true },
    verified: { type: Boolean },
    otp: { type: Number },
    otp_expiry: { type: Date},
    lat: { type: Number },
    lng: { type: Number },
    cart: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", require: true },
        unit: { type: Number, require: true },
      },
    ],
    orders: [],
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model<CustomerDoc>("Customer", CustomerSchema);

export { Customer };
