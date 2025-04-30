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
    const sprouts = await db
      .collection("sprouts")
      .find({})
      .project({ _id: 0, sn: 1, type: 1 })
      .sort({ sn: 1 })
      .toArray();
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
      return res.status(400).send("编码已经存在");
    }
    await db.collection("sprouts").insertOne({ type, sn, createdAt: new Date() });
    res.status(200).send("Serial number added");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding serial number");
  }
});

app.get("/api/bulk", async (req, res) => {
  await connectDB();
  const sns = [
    55472386, 55851934, 55851977, 55851919, 55852000, 55852022, 55852129, 55852270, 55852298, 55852307, 55859698,
    55864202, 55866550, 55866646, 55866865, 55866893, 55866858, 55866859, 55866907, 55910941, 55911875, 55911910,
    55911985, 55911992, 56006943, 56018657, 56018733, 56038552, 56038562, 57388994, 57389012, 57389177, 57417998,
    57418064, 57418083, 57418106, 57418116, 57418132, 57418139, 57418149, 57418176, 57450821, 57450827, 57450864,
    57450956, 57450976, 57450998, 57451050, 57451069, 57450821, 57450931, 57450956, 57451051, 54751441, 57451148,
    57451818, 57451881, 57472315, 57472336, 57472373, 57472379, 57472421, 57472429, 57472533, 57488599, 57488614,
    57488653, 57488736, 57489133, 57489055, 57489078, 54789123, 57489158, 57490128, 57490131, 57490168, 57717354,
    57719206, 58056315,
  ];

  for (const sn of sns) {
    try {
      const existing = await db.collection("sprouts").findOne({ sn: sn.toString() });
      if (existing) {
        console.error(`Serial number ${sn} already exists`);
      } else {
        await db.collection("sprouts").insertOne({ type: "少年哪吒", sn: sn.toString() });
        console.log(`Serial number ${sn} added`);
      }
    } catch (error) {
      console.error(error);
    }
  }
  res.status(200).send("Bulk serial numbers added");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
