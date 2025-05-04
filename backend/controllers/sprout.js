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
      return res.status(400).send("编码已经存在");
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
    55858652, 55858722, 55858743, 55859320, 55859366, 55859697, 55864651, 55911040, 55911543, 55911662, 55911800,
    55918572, 55960033, 55962094, 56007545, 56039390, 56039895, 56040287, 56057128, 57411864, 57411959, 57412042,
    57439840, 57445487, 57446074, 57446294, 57460823, 57480091, 54797775, 57521879, 57719257, 57572895, 57601685,
    57766900,
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
        await db.collection("sprouts").insertOne({ type: "笑笑哪吒", sn: sn.toString(), createdAt: new Date() });
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
