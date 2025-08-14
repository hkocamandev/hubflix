import mongoose, { Document, Schema } from "mongoose";

export interface IDirector extends Document {
  firstName: string;
  secondName: string;
  birthDate: Date;
  bio?: string;
}

const DirectorSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  bio: { type: String }
}, { timestamps: true });

export default mongoose.model<IDirector>("Director", DirectorSchema);