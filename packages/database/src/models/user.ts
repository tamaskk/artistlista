import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "MANAGER", "ARTIST", "FAN"],
      required: true,
      default: "FAN",
    },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    artistId: { type: Schema.Types.ObjectId, ref: "Artist" },
    emailVerifiedAt: { type: Date },
    verifyToken: { type: String },
    verifyTokenExpires: { type: Date },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    status: { type: String, enum: ["active", "pending", "banned"], default: "active" },
    // ── fiókos kedvencek + követés (eszközök közt szinkron) ──────────
    savedEventSlugs: { type: [String], default: [] },
    followedArtistIds: { type: [Schema.Types.ObjectId], ref: "Artist", default: [] },
    followedCities: { type: [String], default: [] }, // város-nevek (követés → új koncert értesítő)
    followedGenres: { type: [String], default: [] }, // műfaj-slugok
    // naptár-feed (Google/Apple előfizetéshez) — titkos, per-user token
    calendarToken: { type: String, index: true, sparse: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema);
