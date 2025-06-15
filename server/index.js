
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

/**
 * POST /api/resize
 * Body: multipart/form-data
 *   - file: image file
 *   - position: one of "center" | "entropy" | "attention"
 */
app.post("/api/resize", upload.single("file"), async (req, res) => {
  try {
    const { position = "center" } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const buffer = req.file.buffer;
    const fit = sharp.fit.cover;
    // 1. 获取图片尺寸，为了 resize origin
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // 2. 统一 resize，fit 尽量全填满, position 由参数决定
    const output = await image
      .resize({
        width: 1080,
        height: 1080,
        fit,
        position,
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(output);
  } catch (err) {
    console.error("Resize Error", err);
    res.status(500).json({ error: "Sharp processing failed." });
  }
});

/**
 * POST /api/origin
 * Returns the original image, forced height=260px
 * Body: multipart/form-data
 *   - file: image
 */
app.post("/api/origin", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const buffer = req.file.buffer;
    // height 260，宽自适应
    const image = sharp(buffer);
    const output = await image
      .resize({ height: 260, fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(output);
  } catch (err) {
    console.error("Origin Error", err);
    res.status(500).json({ error: "Failed to process origin image." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Sharp backend running on port", PORT);
});
