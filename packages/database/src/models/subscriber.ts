import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export type SubscriberDoc = InferSchemaType<typeof subscriberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Subscriber: Model<SubscriberDoc> =
  (mongoose.models.Subscriber as Model<SubscriberDoc>) ||
  mongoose.model<SubscriberDoc>("Subscriber", subscriberSchema);
