import express from "express";
import sql from "../configs/db.js";
import PDFDocument from "pdfkit";
import axios from "axios";
import sharp from "sharp";

const router = express.Router();

// Helper: fetch creation by id
async function getCreationById(id) {
  const rows = await sql`SELECT id, prompt, content, type FROM creations WHERE id = ${id}`;
  return rows?.[0] || null;
}

// Text → PDF generator
async function createPdfBufferFromText({ title, body }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    if (title) {
      doc.fontSize(18).text(title, { underline: true });
      doc.moveDown();
    }
    doc.fontSize(12).text(body || "");
    doc.end();
  });
}

// Image (any format) → PNG converter
async function streamPngFromImageUrl(res, imageUrl, filename) {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  let buffer = Buffer.from(response.data);
  try {
    buffer = await sharp(buffer).png().toBuffer();
    res.setHeader("Content-Type", "image/png");
  } catch (_e) {
    // Fallback: stream original bytes with header from origin
    const contentType = response.headers["content-type"] || "image/png";
    res.setHeader("Content-Type", contentType);
  }
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  res.send(buffer);
}

// Articles PDF
router.get("/article/:id.pdf", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "article") {
      return res.status(404).send("Not found");
    }
    const pdfBuffer = await createPdfBufferFromText({
      title: "AI Article",
      body: creation.content,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"article-${creation.id}.pdf\"`);
    res.end(pdfBuffer);
  } catch (err) {
    res.status(500).send("Failed to download article PDF");
  }
});

// Blog Titles PDF
router.get("/blog-title/:id.pdf", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "blog-title") {
      return res.status(404).send("Not found");
    }
    const pdfBuffer = await createPdfBufferFromText({
      title: "AI Blog Titles",
      body: creation.content,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"blog-titles-${creation.id}.pdf\"`);
    res.end(pdfBuffer);
  } catch (err) {
    res.status(500).send("Failed to download blog titles PDF");
  }
});

// Resume Review PDF
router.get("/resume-review/:id.pdf", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "resume-review") {
      return res.status(404).send("Not found");
    }
    const pdfBuffer = await createPdfBufferFromText({
      title: "Resume Review",
      body: creation.content,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"resume-review-${creation.id}.pdf\"`);
    res.end(pdfBuffer);
  } catch (err) {
    res.status(500).send("Failed to download resume review PDF");
  }
});

// Image PNG (generated image)
router.get("/image/:id.png", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "image") {
      return res.status(404).send("Not found");
    }
    await streamPngFromImageUrl(res, creation.content, `image-${creation.id}.png`);
  } catch (err) {
    res.status(500).send("Failed to download image PNG");
  }
});

// Background removed PNG
router.get("/bg-removed/:id.png", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "image") {
      return res.status(404).send("Not found");
    }
    await streamPngFromImageUrl(res, creation.content, `bg-removed-${creation.id}.png`);
  } catch (err) {
    res.status(500).send("Failed to download bg-removed PNG");
  }
});

// Object removed PNG
router.get("/object-removed/:id.png", async (req, res) => {
  try {
    const creation = await getCreationById(req.params.id);
    if (!creation || creation.type !== "image") {
      return res.status(404).send("Not found");
    }
    await streamPngFromImageUrl(res, creation.content, `object-removed-${creation.id}.png`);
  } catch (err) {
    res.status(500).send("Failed to download object-removed PNG");
  }
});

export default router;


