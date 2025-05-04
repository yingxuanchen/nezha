import { getDB } from "../db.js";
import PDFDocumentWithTables from "pdfkit-table";
import PDFDocument from "pdfkit";
import path from "path";

const FONT_PATH = path.resolve("fonts", "NotoSansSC-Regular.ttf");

export const types = [
  { name: "少年哪吒", lightBgColor: "pink", darkBgColor: "brown" },
  { name: "笑笑哪吒", lightBgColor: "bisque", darkBgColor: "darkorange" },
  { name: "灵珠版哪吒", lightBgColor: "lavender", darkBgColor: "mediumpurple" },
  { name: "战斗哪吒", lightBgColor: "palegreen", darkBgColor: "mediumseagreen" },
  { name: "坏坏哪吒", lightBgColor: "lightyellow", darkBgColor: "darkkhaki" },
  { name: "笑笑敖丙", lightBgColor: "aqua", darkBgColor: "deepskyblue" },
  { name: "委屈敖丙", lightBgColor: "lightblue", darkBgColor: "steelblue" },
];

export async function getSprouts(req, res) {
  try {
    const db = getDB();
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
}

export async function addSprout(req, res) {
  const { type, sn } = req.body;

  try {
    const db = getDB();
    const existing = await db.collection("sprouts").findOne({ sn });
    if (existing) {
      return res.status(400).send(`编码已存在，是${existing.type}!`);
    }
    await db.collection("sprouts").insertOne({ type, sn, createdAt: new Date() });
    res.status(200).send("Serial number added");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding serial number");
  }
}

export async function addInBulk(req, res) {
  const sns = [
    14561791, 14689271, 55851871, 55851919, 55851934, 55851977, 55852000, 55852113, 55852129, 55852118, 55852295,
    55852298, 55859698, 55864202, 55866550, 55866646, 55866858, 55866865, 55866885, 55866907, 55866969, 55867024,
    55910941, 55911803, 55911875, 55911985, 55911992, 55969225, 56006943, 56007036, 56018644, 56018675, 56018733,
    56038537, 56038552, 56056272, 56056304, 56056315, 57388994, 57389012, 57417998, 57418064, 57418083, 57418106,
    57418116, 57418132, 57418139, 57418149, 57418170, 57418176, 57418210, 57420565, 57450807, 57450821, 57450827,
    57450868, 57450891, 57450931, 57450946, 57450956, 57450963, 57450976, 57450998, 57451026, 57451050, 57451051,
    57451069, 57451075, 57451148, 57451173, 57451189, 57451818, 57472362, 57472373, 57472421, 57472429, 57472480,
    57472496, 57472497, 57472502, 57472554, 57472567, 57472576, 57472594, 57472692, 57488459, 57488546, 57488550,
    57488552, 57488571, 57488586, 57488599, 57488614, 57488675, 57488736, 57488880, 57488913, 57489051, 57489055,
    57489078, 57489133, 57489135, 57489158, 57489169, 57489213, 57490128, 57490168, 57490188, 57490195, 57719206,
    57717354, 58056315,
  ];

  let insertedCount = 0;
  let existingCount = 0;

  for (const sn of sns) {
    try {
      const db = getDB();
      const existing = await db.collection("sprouts").findOne({ sn: sn.toString() });
      if (existing) {
        existingCount++;
        console.error(`Serial number ${sn} already exists`);
      } else {
        await db.collection("sprouts").insertOne({ type: "少年哪吒", sn: sn.toString(), createdAt: new Date() });
        insertedCount++;
        console.log(`Serial number ${sn} added`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  console.log(`total: ${sns.length}`);
  console.log(`inserted: ${insertedCount}`);
  console.log(`existing: ${existingCount}`);

  res.status(200).send("Bulk serial numbers added");
}

export async function exportToPdf(req, res) {
  try {
    const db = getDB();
    const sprouts = await db
      .collection("sprouts")
      .find({})
      .project({ _id: 0, sn: 1, type: 1 })
      .sort({ sn: 1 })
      .toArray();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="nezha.pdf"');

    let doc = new PDFDocumentWithTables({ margin: 30, size: "A4" });
    doc.pipe(res);

    doc.registerFont("NotoSansSC", FONT_PATH);
    doc.font("NotoSansSC");

    doc.text("总数: " + sprouts.length + "\n\n");

    const table = {
      title: "哪吒芽豆豆编码",
      headers: [
        { label: "编码", property: "sn", width: 100 },
        { label: "款式", property: "type", width: 100 },
      ],
      datas: sprouts.map((sprout) => {
        const bgColor = types.find((type) => type.name === sprout.type)?.lightBgColor || "transparent";
        return {
          sn: sprout.sn,
          type: sprout.type,
          options: { backgroundColor: bgColor, backgroundOpacity: 1 },
        };
      }),
    };

    await doc.table(table, {
      hideHeader: true,
      prepareHeader: () => {},
      prepareRow: () => doc.font("NotoSansSC"),
    });
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting pdf");
  }
}

export async function exportGrouped(req, res) {
  try {
    const db = getDB();
    const allSprouts = await db
      .collection("sprouts")
      .find({})
      .project({ _id: 0, sn: 1, type: 1 })
      .sort({ type: 1, sn: 1 })
      .toArray();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="nezha-grouped.pdf"');

    const sections = {};
    for (const type of types) {
      const lines = [];
      lines.push(type.name);
      const sprouts = allSprouts.filter((sprout) => sprout.type === type.name);

      for (let i = 0; i < sprouts.length; i += 4) {
        const line = sprouts
          .slice(i, i + 4)
          .map((sprout) => `${sprout.sn.slice(0, 4)}(${sprout.sn.slice(4)})`)
          .join(", ");

        lines.push(line);
      }

      sections[type.name] = lines;
    }

    const doc = new PDFDocument({ size: "A4", margins: { top: 10, left: 100, right: 30, bottom: 10 } });
    doc.pipe(res);

    doc.registerFont("NotoSansSC", FONT_PATH);
    doc.font("NotoSansSC");

    doc.text("总数: " + allSprouts.length + "\n\n");

    for (const [key, lines] of Object.entries(sections)) {
      doc.text(lines.join("\n"));
      if (key === "灵珠版哪吒" || key === "战斗哪吒" || key === "委屈敖丙") {
        doc.text("\n");
      } else {
        doc.addPage();
      }
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting pdf");
  }
}
