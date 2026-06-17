const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const logger = require('./logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const documentAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A detailed, professional, and comprehensive summary of the document (2-3 paragraphs)."
    },
    keyPoints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "A list of 5-7 key takeaways/insights."
    },
    entities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "A list of important people, organizations, dates, or technologies mentioned."
    },
    sentiment: {
      type: SchemaType.STRING,
      description: "The overall tone/sentiment (Positive, Negative, or Neutral)."
    },
    category: {
      type: SchemaType.STRING,
      description: "The type/category of the document (e.g., Resume/CV, Legal Agreement, Financial Statement, Technical Document, etc.)."
    }
  },
  required: ["summary", "keyPoints", "entities", "sentiment", "category"]
};

const imageAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A detailed, professional, and comprehensive summary of the image content (2-3 paragraphs)."
    },
    extractedText: {
      type: SchemaType.STRING,
      description: "All text found/transcribed in the image (OCR)."
    },
    keyPoints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "A list of 5-7 key observations or takeaways."
    },
    entities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "A list of important people, organizations, dates, or objects identified."
    },
    sentiment: {
      type: SchemaType.STRING,
      description: "Overall sentiment (Neutral, Positive, Negative)."
    },
    category: {
      type: SchemaType.STRING,
      description: "Content category (e.g., Financial, Legal, Technical, General, Photo, Chart, Diagram)."
    }
  },
  required: ["summary", "extractedText", "keyPoints", "entities", "sentiment", "category"]
};

/**
 * Generate a structured summary from document text using Gemini.
 */
async function generateDocumentSummary(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert document analyst. Analyze the following document text and provide a structured JSON response.

      Document Text:
      "${text.substring(0, 30000)}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: documentAnalysisSchema
      }
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    logger.error('Error generating summary with Gemini', { error: error.message });
    throw new Error('Failed to generate document summary');
  }
}

/**
 * Analyze an image using Gemini Vision API.
 */
async function analyzeImage(imageBuffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    };

    const prompt = `You are an expert document analyst. Analyze this image thoroughly. Extract ALL text visible in the image (OCR). Then analyze the content.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: imageAnalysisSchema
      }
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    logger.error('Error analyzing image with Gemini Vision', { error: error.message });
    throw new Error('Failed to analyze image');
  }
}

/**
 * Chat with a document — ask questions about document content using Gemini.
 * Uses the extracted text as context for conversational Q&A.
 */
async function chatWithDocument(documentText, question, chatHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation context
    let historyContext = '';
    if (chatHistory.length > 0) {
      historyContext = '\n\nPrevious conversation:\n' +
        chatHistory.slice(-6).map(msg =>
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }

    const prompt = `You are a helpful document assistant. Answer questions about the document below.

RULES:
- Answer ONLY based on the document content provided
- If the answer is not in the document, say "I couldn't find that information in this document."
- Be concise but thorough
- Use bullet points when listing multiple items
- Quote relevant sections when appropriate

DOCUMENT CONTENT:
"""
${documentText.substring(0, 25000)}
"""
${historyContext}

USER QUESTION: ${question}

Provide a helpful, accurate answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error('Error in document chat', { error: error.message });
    throw new Error('Failed to get response from AI');
  }
}

module.exports = {
  generateDocumentSummary,
  analyzeImage,
  chatWithDocument
};
