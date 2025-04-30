import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

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

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db();
  }
}

app.get("/api/sprouts", async (req, res) => {
  try {
    await connectDB();
    const sprouts = await db.collection("sprouts").find({}).sort({ sn: 1 }).toArray();
    res.json(sprouts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching serial numbers");
  }
});

app.post("/api/sprouts", async (req, res) => {
  const { type, sn } = req.body;
  try {
    await connectDB();
    const existing = await db.collection("sprouts").findOne({ sn });
    if (existing) {
      return res.status(400).send("Serial number already exists");
    }
    await db.collection("sprouts").insertOne({ type, sn });
    res.status(200).send("Serial number added");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding serial number");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
