const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const storage = multerS3({
    s3: s3,
    bucket: 'df-institute-management',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        cb(null, Date.now().toString());
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 50 * 1024 },
});

const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Handle Multer's "File too large" error
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(403).json({ status: false, message: "File size too large. Max allowed size is 50KB." });
            }
            // Handle other Multer errors if needed
            return res.status(500).json({ status: false, message: "File upload error." });
        } else if (err) {
            // Handle other errors
            return res.status(500).json({ status: false, message: "Internal server error." });
        }
        next();
    });
};

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('message: Images only (jpeg, jpg, png)!');
    }
}

const fileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(403).json({ status: false, message: "Please upload a file." });
    }

    let data = {
        url: req.file.location,
        type: req.file.mimetype
    };

    try {
        res.send({
            data: data,
            message: "File uploaded successfully.",
        });
    } catch (err) {
        console.error("File upload error:", err);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
};

module.exports = {
    uploadMiddleware,
    fileUpload
};