import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

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
    const sprouts = await db.collection("sprouts").find({}).toArray();
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
