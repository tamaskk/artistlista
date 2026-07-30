import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const genreSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
});

export type GenreDoc = InferSchemaType<typeof genreSchema> & { _id: mongoose.Types.ObjectId };

export const Genre: Model<GenreDoc> =
  (mongoose.models.Genre as Model<GenreDoc>) || mongoose.model<GenreDoc>("Genre", genreSchema);
