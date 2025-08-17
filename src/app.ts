/**
 * Hubflix Express Application Configuration
 * 
 * This file sets up the Express application with core middlewares, routes, and error handling.
 * It serves as the central configuration point for all HTTP request processing in the Hubflix API.
 */

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";          // Security middleware to set HTTP headers
import cors from "cors";              // Enable Cross-Origin Resource Sharing
import xss from "xss-clean";          // Sanitize user input to prevent XSS attacks
import rateLimit from "express-rate-limit"; // Limit repeated requests for security

import movieRoutes from "./routes/movieRoutes";       // Movie-related API endpoints
import directorRoutes from "./routes/directorRoutes"; // Director-related API endpoints
import healthRoute from "./routes/health.route";      // Health check endpoint

import notFound from "./middlewares/notFound";        // Middleware for 404 handling
import errorHandler from "./middlewares/errorHandler";// Centralized error handler

dotenv.config();
const app = express();

// Core middlewares
app.use(express.json()); // Parse JSON request bodies
app.use(helmet());       // Apply security headers
app.use(cors());         // Enable CORS for all routes
app.use(xss());          // Protect against cross-site scripting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // Limit each IP to 100 requests per window
  })
);

// Route registration
app.use("/api/movies", movieRoutes);       // Mount movie-related routes
app.use("/api/directors", directorRoutes); // Mount director-related routes
app.use("/health", healthRoute);           // Mount health check route

// Error handling middlewares
app.use(notFound);       // Handle unmatched routes
app.use(errorHandler);   // Handle application errors centrally

export default app;
