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
 * Helper to convert user custom schema specification into Gemini responseSchema format.
 */
function convertToGeminiSchema(customSchema) {
  if (!customSchema) return null;
  // If it's already a SchemaType object with fields
  if (customSchema.type && customSchema.properties) return customSchema;

  const fields = Array.isArray(customSchema) ? customSchema : (customSchema.fields || []);
  if (fields.length === 0) return null;

  const properties = {};
  const required = [];

  fields.forEach(field => {
    if (!field.name) return;

    let type;
    switch (field.type) {
      case 'number':
        type = SchemaType.NUMBER;
        break;
      case 'boolean':
        type = SchemaType.BOOLEAN;
        break;
      case 'array':
        type = SchemaType.ARRAY;
        break;
      case 'object':
        type = SchemaType.OBJECT;
        break;
      default:
        type = SchemaType.STRING;
    }

    properties[field.name] = {
      type: type,
      description: field.description || `Extracted ${field.name}`
    };

    if (field.type === 'array') {
      properties[field.name].items = { type: SchemaType.STRING };
    }

    if (field.required !== false) {
      required.push(field.name);
    }
  });

  return {
    type: SchemaType.OBJECT,
    properties,
    required
  };
}

/**
 * Generate a structured summary from document text using Gemini.
 */
async function generateDocumentSummary(text, customSchema = null, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const activeSchema = convertToGeminiSchema(customSchema) || documentAnalysisSchema;

    const prompt = `
      You are an expert document analyst. Analyze the following document text and provide a structured JSON response matching the requested schema.

      Document Text:
      "${text.substring(0, 30000)}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: activeSchema
      }
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    logger.error('Error generating summary with Gemini', { error: error.message, model: modelName });
    throw new Error('Failed to generate document summary: ' + error.message);
  }
}

/**
 * Analyze an image using Gemini Vision API.
 */
async function analyzeImage(imageBuffer, mimeType, customSchema = null, modelName = 'gemini-2.5-flash') {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const activeSchema = convertToGeminiSchema(customSchema) || imageAnalysisSchema;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      }
    };

    const prompt = `You are an expert document analyst. Analyze this image thoroughly and provide a structured JSON response matching the requested schema. Extract ALL text visible in the image (OCR) if matching fields require it.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: activeSchema
      }
    });

    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    logger.error('Error analyzing image with Gemini Vision', { error: error.message, model: modelName });
    throw new Error('Failed to analyze image: ' + error.message);
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

/**
 * Generate embedding values (vector) for the given text using Gemini.
 */
async function generateEmbeddings(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text.substring(0, 8000));
    return result.embedding.values;
  } catch (error) {
    logger.error('Error generating embeddings with Gemini', { error: error.message });
    return null;
  }
}

module.exports = {
  generateDocumentSummary,
  analyzeImage,
  chatWithDocument,
  generateEmbeddings
};
