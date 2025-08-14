import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";

import movieRoutes from "./routes/movieRoutes";
import directorRoutes from "./routes/directorRoutes";
import healthRoute from "./routes/health.route";

import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";

dotenv.config();
const app = express();

// core middlewares
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// routes
app.use("/api/movies", movieRoutes);
app.use("/api/directors", directorRoutes);
app.use("/health", healthRoute);

// error handling
app.use(notFound);
app.use(errorHandler);

export default app;