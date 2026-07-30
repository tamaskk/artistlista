import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const venueSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, default: "" },
      country: { type: String, default: "HU" },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    type: {
      type: String,
      enum: ["club", "arena", "outdoor", "festival", "bar", "culture_house", "other"],
      default: "other",
    },
    capacity: { type: Number },
    website: { type: String },
    images: { type: [String], default: [] },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "merged", "archived"], default: "active" },
    mergedIntoId: { type: Schema.Types.ObjectId, ref: "Venue" },
  },
  { timestamps: true },
);

venueSchema.index({ location: "2dsphere" });
venueSchema.index({ "address.city": 1 });

export type VenueDoc = InferSchemaType<typeof venueSchema> & {
  _id: mongoose.Types.ObjectId;
  // a nested objektumok a sémában mindig jelen vannak — kötelezővé tesszük a típusban
  address: { street: string; city: string; zip: string; country: string };
  location: { type: "Point"; coordinates: number[] };
  createdAt: Date;
  updatedAt: Date;
};

export const Venue: Model<VenueDoc> =
  (mongoose.models.Venue as Model<VenueDoc>) || mongoose.model<VenueDoc>("Venue", venueSchema);
