const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const DocumentData = require('../models/DocumentData');
const ApiKey = require('../models/ApiKey');
const ApiUsage = require('../models/ApiUsage');
const verifyToken = require('../middleware/auth');
const logger = require('../utils/logger');

// All admin routes require authentication
router.use(verifyToken);

// DELETE /api/admin/cleanup-documents — Clean up stuck documents
router.delete('/cleanup-documents', async (req, res, next) => {
  try {
    const documents = await Document.find({ status: 'processing' });

    let cleanedCount = 0;
    for (const doc of documents) {
      if (doc.tempFilePath && !doc.tempFilePath.startsWith('gs://') && !fs.existsSync(doc.tempFilePath)) {
        await Document.findByIdAndDelete(doc._id);
        await Promise.all([
          DocumentData.deleteMany({ documentId: doc._id }),
          ApiKey.deleteMany({ documentId: doc._id }),
          ApiUsage.deleteMany({ documentId: doc._id })
        ]);
        cleanedCount++;

        // Try to remove temp file if it exists
        const currentTempPath = path.join(__dirname, '..', 'temp', path.basename(doc.tempFilePath));
        if (fs.existsSync(currentTempPath)) {
          fs.unlinkSync(currentTempPath);
        }
      }
    }

    logger.info('Admin cleanup completed', { cleanedCount });
    res.json({ message: `Cleaned up ${cleanedCount} invalid documents` });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/clear-all-documents — Clear all documents (debugging)
router.delete('/clear-all-documents', async (req, res, next) => {
  try {
    const result = await Document.deleteMany({});
    await Promise.all([
      DocumentData.deleteMany({}),
      ApiKey.deleteMany({}),
      ApiUsage.deleteMany({})
    ]);

    // Clean up temp directory
    const tempDir = path.join(__dirname, '..', 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    }

    logger.warn('Admin cleared all documents', { deletedCount: result.deletedCount });
    res.json({ message: `Cleared ${result.deletedCount} documents and cleaned temp directory` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
