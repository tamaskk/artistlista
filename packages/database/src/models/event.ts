import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    artistIds: { type: [Schema.Types.ObjectId], ref: "Artist", required: true }, // [0] = headliner
    guestArtistNames: { type: [String], default: [] },
    venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
    // ── denormalizált mezők (venue + artist szinkron) ───────────────
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    city: { type: String, required: true },
    venueName: { type: String, required: true },
    genres: { type: [String], default: [] },
    artistNames: { type: [String], default: [] },
    // ────────────────────────────────────────────────────────────────
    startsAt: { type: Date, required: true }, // UTC
    doorsAt: { type: Date },
    endsAt: { type: Date },
    price: {
      kind: { type: String, enum: ["free", "paid", "unknown"], default: "unknown" },
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "HUF" },
    },
    ticketUrl: { type: String },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    cancelReason: { type: String, default: "" }, // lemondás indoka (publikus)
    status: {
      type: String,
      enum: ["draft", "pending", "published", "cancelled", "soldout"],
      default: "draft",
    },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    // ── publikus beküldés + jóváhagyás-útvonal ──────────────────────
    submittedByUserId: { type: Schema.Types.ObjectId, ref: "User" }, // ki küldte be (külsős user)
    pendingApprovalArtistId: { type: Schema.Types.ObjectId, ref: "Artist" }, // ha az előadó (claim-elt) hagyja jóvá
    stats: {
      views: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
    },
    featured: { type: Boolean, default: false },
    // ── fizetős kiemelés (hirdetés) ─────────────────────────────────
    promotion: {
      tier: { type: Number, default: 0 }, // 0 = nincs, 1..5
      activeUntil: { type: Date },
      purchasedAt: { type: Date },
    },
  },
  { timestamps: true },
);

eventSchema.index({ "promotion.tier": -1, "promotion.activeUntil": 1 });

eventSchema.index({ location: "2dsphere" });
eventSchema.index({ status: 1, startsAt: 1 });
eventSchema.index({ city: 1, startsAt: 1 });
eventSchema.index({ artistIds: 1, startsAt: 1 });
eventSchema.index({ genres: 1 });
eventSchema.index({ title: "text", artistNames: "text", venueName: "text" });

export type EventDoc = InferSchemaType<typeof eventSchema> & {
  _id: mongoose.Types.ObjectId;
  location: { type: "Point"; coordinates: number[] };
  price: { kind: "free" | "paid" | "unknown"; min?: number; max?: number; currency: string };
  stats: { views: number; saves: number };
  promotion?: { tier: number; activeUntil?: Date; purchasedAt?: Date };
  createdAt: Date;
  updatedAt: Date;
};

export const Event: Model<EventDoc> =
  (mongoose.models.Event as Model<EventDoc>) || mongoose.model<EventDoc>("Event", eventSchema);
