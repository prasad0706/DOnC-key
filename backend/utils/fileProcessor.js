const axios = require('axios');
const pdf = require('pdf-parse');

async function downloadFile(url) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download file');
    }
}

async function extractText(buffer, mimeType) {
    try {
        if (mimeType === 'application/pdf') {
            const data = await pdf(buffer);
            return data.text;
        }
        // Add image processing logic here later if needed (using OCR)
        else if (mimeType.startsWith('text/')) {
            return buffer.toString('utf-8');
        }
        else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error('Failed to extract text from file');
    }
}

module.exports = {
    downloadFile,
    extractText
};
