/**
 * Hubflix Express API Entry Point
 * 
 * This file serves as the main entry point for the Hubflix Express application.
 * It establishes a connection to the MongoDB database and starts the HTTP server.
 */

import app from "./app";           // Import the configured Express application
import { connectDB } from "./config/db"; // Import database connection utility

const PORT = process.env.PORT || 3001;  // Use environment PORT or default to 3001

(async () => {
  // Establish MongoDB connection before starting the server
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Hubflix API running on http://localhost:${PORT}`);
  });
})();
