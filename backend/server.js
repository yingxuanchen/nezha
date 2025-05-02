import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import sproutRoutes from "./routes/sprout.js";

const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:5173", "https://yingxuanchen.github.io"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use("/api", sproutRoutes);

await connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
