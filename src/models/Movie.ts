import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  description?: string;
  releaseDate: Date;
  genre: string;
  rating: number;
  imdbId: string;
  director: mongoose.Types.ObjectId;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    releaseDate: { type: Date, required: true },
    genre: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 10, required: true },
    imdbId: { type: String, required: true, unique: true, trim: true },
    director: { type: Schema.Types.ObjectId, ref: "Director", required: true }
  },
  { timestamps: true }
);

MovieSchema.index({ title: 1, imdbId: 1 });

export default mongoose.model<IMovie>("Movie", MovieSchema);
