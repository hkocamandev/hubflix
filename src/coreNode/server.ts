import http from "http";
import connectCoreDB from "./db/mongo";
import { coreRouter } from "./routes/coreRouter";

const PORT = 4000;

// Connect to the MongoDB database and then start the HTTP server
connectCoreDB().then(() => {
  // Create an HTTP server using the coreRouter to handle all incoming requests
  const server = http.createServer(coreRouter);

  // Start listening on the defined port and log a confirmation message
  server.listen(PORT, () =>
    console.log(`Core Node Server running on port ${PORT}`)
  );
});
