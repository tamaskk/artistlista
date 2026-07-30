import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const inviteSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true },
);

export type InviteDoc = InferSchemaType<typeof inviteSchema> & { _id: mongoose.Types.ObjectId };

export const Invite: Model<InviteDoc> =
  (mongoose.models.Invite as Model<InviteDoc>) || mongoose.model<InviteDoc>("Invite", inviteSchema);
