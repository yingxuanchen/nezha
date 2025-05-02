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
    54749490, 55815412, 55852976, 55853042, 55854421, 55854546, 55854460, 55854560, 55854567, 55854734, 55854762,
    55854825, 55910552, 55911097, 55911491, 55942595, 55959585, 55962485, 55962622, 55962858, 55962989, 55963519,
    55963217, 55963667, 55963758, 55968661, 56018703, 56019616, 56045170, 56045194, 56047939, 57391632, 57398806,
    57418901, 57420543, 57420578, 57420791, 57420899, 57423699, 57440642, 57440800, 57440929, 57490292, 57440365,
    57441266, 57441333, 57441577, 57449531, 57449534, 57449575, 57449580, 57449940, 57451663, 57451689, 57451765,
    57451806, 57451847, 57451892, 57452040, 57460289, 57466036, 57481218, 57487496, 57487624, 57487684, 57487930,
    57515738, 57515947, 57516115, 57516344, 57516835, 57516947, 57516911, 57516956, 57517060, 57520339, 57532375,
    57632434, 57632791, 57645743, 57645891, 57671915, 57713278,
  ];

  for (const sn of sns) {
    try {
      const db = getDB();
      const existing = await db.collection("sprouts").findOne({ sn: sn.toString() });
      if (existing) {
        console.error(`Serial number ${sn} already exists`);
      } else {
        await db.collection("sprouts").insertOne({ type: "笑笑敖丙", sn: sn.toString() });
        console.log(`Serial number ${sn} added`);
      }
    } catch (error) {
      console.error(error);
    }
  }
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
