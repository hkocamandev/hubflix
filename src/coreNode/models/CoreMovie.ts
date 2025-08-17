import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICoreMovie extends Document {
  title: string;
  description?: string;
  releaseDate: Date;
  genre: string;
  rating: number;
  imdbId: string;
  director: Types.ObjectId; // MongoDB ilişkisi
  directorNconst?: string | null; // OMDb director ID
  tconst?: string | null; // OMDb movie ID
}

const CoreMovieSchema: Schema = new Schema<ICoreMovie>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    releaseDate: { type: Date, required: true },
    genre: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 10, required: true },
    imdbId: { type: String, required: true, unique: true, trim: true },
    director: {
      type: Schema.Types.ObjectId,
      ref: "CoreDirector",
      required: true,
    },
    directorNconst: { type: String, default: null }, // OMDb director ID
    tconst: { type: String, default: null }, // OMDb movie ID
  },
  { timestamps: true }
);

export default mongoose.model<ICoreMovie>("CoreMovie", CoreMovieSchema);
