import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    website: { type: String },
  },
  { timestamps: true },
);

export type OrganizationDoc = InferSchemaType<typeof organizationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Organization: Model<OrganizationDoc> =
  (mongoose.models.Organization as Model<OrganizationDoc>) ||
  mongoose.model<OrganizationDoc>("Organization", organizationSchema);
