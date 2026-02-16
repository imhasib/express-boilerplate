const express = require("express");
const multer = require("multer");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const fileValidation = require("../../validations/file.validation");
const fileController = require("../../controllers/file.controller");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max before compression
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post("/", auth(), upload.single("file"), fileController.uploadFile);

router.get(
  "/:fileId",
  validate(fileValidation.getFile),
  fileController.getFile,
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and retrieval
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file
 *     description: Upload an image file. Images are automatically compressed to max 100KB.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB before compression)
 *     responses:
 *       "201":
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: File ID
 *                 filename:
 *                   type: string
 *                   description: Generated filename
 *                 originalName:
 *                   type: string
 *                   description: Original filename
 *                 mimeType:
 *                   type: string
 *                   description: MIME type of the file
 *                 size:
 *                   type: number
 *                   description: File size in bytes (after compression)
 *                 link:
 *                   type: string
 *                   description: URL to access the file
 *       "400":
 *         description: No file uploaded or invalid file type
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /file/{id}:
 *   get:
 *     summary: Get a file
 *     description: Download/view a file by its ID.
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       "200":
 *         description: File content
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
