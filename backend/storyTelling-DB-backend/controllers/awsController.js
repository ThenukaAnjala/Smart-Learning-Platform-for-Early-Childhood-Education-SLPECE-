const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.generatePresignedUrl = async (req, res) => {
  try {
    const { s3Uri } = req.query;
    
    if (!s3Uri) {
      return res.status(400).json({ error: "s3Uri query parameter is required" });
    }

    // Extract key from S3 URI
    const key = s3Uri.replace('s3://background-music-final-year-research/', '');
    const decodedKey = decodeURIComponent(key);

    const params = {
      Bucket: 'background-music-final-year-research',
      Key: decodedKey,
      Expires: 3600
    };

    const presignedUrl = s3.getSignedUrl('getObject', params);
    
    res.json({ 
      success: true,
      url: presignedUrl 
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate presigned URL',
      details: error.message
    });
  }
};