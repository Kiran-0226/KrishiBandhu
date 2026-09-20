const multer = require('multer');
const path = require('path');
const fs = require('fs');

/*
 * ==========================================
 * Receipt Upload Directory
 * ==========================================
 */

const uploadDirectory = path.join(
  __dirname,
  '..',
  'uploads',
  'parchi-receipts',
);

/*
 * Create directory automatically
 */

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/*
 * ==========================================
 * Storage Configuration
 * ==========================================
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      uploadDirectory,
    );
  },

  filename: (
    req,
    file,
    cb,
  ) => {
    const extension =
      path.extname(
        file.originalname,
      );

    const baseName =
      path
        .basename(
          file.originalname,
          extension,
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          '_',
        );

    const uniqueName =
      `${Date.now()}-${baseName}${extension}`;

    cb(
      null,
      uniqueName,
    );
  },
});

/*
 * ==========================================
 * Allowed File Types
 * ==========================================
 */

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const fileFilter = (
  req,
  file,
  cb,
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype,
    )
  ) {
    cb(
      null,
      true,
    );
  } else {
    cb(
      new Error(
        'Only JPG, JPEG, PNG, WEBP images and PDF receipts are allowed.',
      ),
      false,
    );
  }
};

/*
 * ==========================================
 * Multer Configuration
 * ==========================================
 *
 * Maximum receipt size:
 * 5 MB
 */

const uploadParchiReceipt =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });

module.exports = {
  uploadParchiReceipt,
};