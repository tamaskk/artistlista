import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const artistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    shortBio: { type: String, maxlength: 280, default: "" },
    bio: { type: String, default: "" },
    genres: { type: [String], default: [] },
    homeCity: { type: String, default: "" },
    images: {
      avatar: { type: String, default: "" },
      cover: { type: String, default: "" },
      gallery: { type: [String], default: [] },
    },
    links: { type: Map, of: String, default: {} },
    embeds: {
      spotifyArtistId: { type: String, default: "" },
      youtubeVideoId: { type: String, default: "" },
    },
    booking: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      public: { type: Boolean, default: false },
    },
    ownerType: { type: String, enum: ["organization", "user"], required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User" },
    submittedByUserId: { type: Schema.Types.ObjectId, ref: "User" }, // külsős user hozta létre beküldéskor
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    stats: {
      followers: { type: Number, default: 0 },
      views30d: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

artistSchema.index({ status: 1, featured: -1 });
artistSchema.index({ name: "text", shortBio: "text" });

export type ArtistDoc = InferSchemaType<typeof artistSchema> & {
  _id: mongoose.Types.ObjectId;
  images: { avatar: string; cover: string; gallery: string[] };
  embeds: { spotifyArtistId: string; youtubeVideoId: string };
  booking: { email: string; phone: string; public: boolean };
  stats: { followers: number; views30d: number };
  createdAt: Date;
  updatedAt: Date;
};

export const Artist: Model<ArtistDoc> =
  (mongoose.models.Artist as Model<ArtistDoc>) || mongoose.model<ArtistDoc>("Artist", artistSchema);
