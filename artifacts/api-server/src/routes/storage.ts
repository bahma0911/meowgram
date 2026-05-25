import express from "express";
import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../lib/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

async function uploadFileToCloudinary(file: Express.Multer.File) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "meowgram",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(result);
      },
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
}

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadFileToCloudinary(req.file);

    return res.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
