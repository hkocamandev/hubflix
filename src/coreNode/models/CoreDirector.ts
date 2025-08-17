import mongoose, { Document, Schema } from "mongoose";

export interface ICoreDirector extends Document {
  firstName: string;
  secondName: string;
  birthDate: Date;
  bio?: string;
  nconst?: string | null; // OMDb ID
}

const CoreDirectorSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    bio: { type: String },
    nconst: { type: String, default: null },
  },
  { timestamps: true }
);

// nconst: lookup can be done with this index
CoreDirectorSchema.index({ nconst: 1 });

export default mongoose.model<ICoreDirector>(
  "CoreDirector",
  CoreDirectorSchema
);
