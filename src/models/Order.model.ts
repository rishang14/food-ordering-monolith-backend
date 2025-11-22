import mongoose, { Schema, Document } from "mongoose";
import type { FoodsType } from "./Food.models.ts";

export interface OrderDoc extends Document {
  userId: string;
  vendorId: string;
  items: FoodsType[];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  orderStatus:
    | "Created"
    | "Accepted"
    | "Canceled"
    | "Rejected"
    | "Preparing"
    | "Completed";
  remarks: string;
  deliveryId: string;
  readyTime: number;
  expiresAT: Date;
  idempotencyKey: string;
  expiresAt: Date;
  bullJobId: string | null;
  chatId: string | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  completedAt: Date | null;
}

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true },
    vendorId: { type: String, require: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", require: true },
        unit: { type: Number, require: true },
      },
    ],
    totalAmount: { type: Number, require: true },
    paidAmount: { type: Number, },
    orderDate: { type: Date },
    orderStatus: {
      type: String,
      enum: [
        "Created",
        "Accepted",
        "Canceled",
        "Rejected",
        "Preparing",
        "Completed",
      ],
      required: true,
    },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
    idempotencyKey: { type: String, select: false },
    expiresAt: { type: Date },
    bullJobId: { type: String, select: false },

    chatId: { type: String },

    version: { type: Number, default: 1, select: false },

    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
