import type { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const uploadDir = path.join(process.cwd(), "attached_assets");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerUploadRoutes(app: Express) {
    // Serve static files
    app.use("/attached_assets", express.static(uploadDir));

    // Upload endpoint
    app.post("/api/upload", upload.single("file"), (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `/attached_assets/${req.file.filename}`;
        res.json({ url: fileUrl, filename: req.file.filename });
    });
}
