import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 3001;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Hubflix API running on trst  http://localhost:${PORT}`);
  });
})();