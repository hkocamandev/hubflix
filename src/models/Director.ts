import { Schema, model, Types } from "mongoose";

const DirectorSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    secondName: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    bio: { type: String, default: "" }
  },
  { timestamps: true }
);

export type Director = {
  _id: Types.ObjectId;
  firstName: string;
  secondName: string;
  birthDate: Date;
  bio?: string;
};

export default model<Director>("Director", DirectorSchema);