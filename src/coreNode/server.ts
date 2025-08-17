import http from "http";
import  connectCoreDB  from "./db/mongo";
import { coreRouter } from "./routes/coreRouter";

const PORT = 4000;

connectCoreDB().then(() => {
  const server = http.createServer(coreRouter);
  server.listen(PORT, () =>
    console.log(`Core Node Server running on port ${PORT}`)
  );
});
