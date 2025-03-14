const express = require('express');
const router = express.Router();
const s3Controller = require('../controllers/awsController');

// Middleware (if needed)
router.use(express.json());

// Generate presigned URL route
router.get('/get-presigned-url', s3Controller.generatePresignedUrl);

module.exports = router;