import mongoose, { Schema, Document, Types } from "mongoose";

interface VendorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: string[];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  serviceAvailable: boolean; 
  orders:Types.ObjectId[]
  coverImages: string[];
  rating: number;
  lat: number;
  lng: number;
}

const VendorSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true }, 
    orders: [{ type: Schema.Types.ObjectId, ref: "order" }],
    password: { type: String, required: true, select: false },
    serviceAvailable: { type: Boolean, default: true },
    coverImages: { type: [String] },
    rating: { type: Number, default: 0 },
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

VendorSchema.virtual("foods", {
  ref: "food",
  localField: "_id",
  foreignField: "vendorId",
});

const Vendor = mongoose.model<VendorDoc>("Vendor", VendorSchema);

export { Vendor };
