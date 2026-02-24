const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateDocumentSummary(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert document analyst. Analyze the following document text and provide a structured JSON response.
      
      Output ONLY valid JSON. Do not use markdown code blocks (\`\`\`json).
      
      Structure:
      {
        "summary": "A comprehensive summary of the document (2-3 paragraphs)",
        "keyPoints": ["List of 5-7 key takeaways"],
        "entities": ["List of important people, organizations, or dates mentioned"],
        "sentiment": "Overall sentiment (Neutral, Positive, Negative)",
        "category": "Document category (e.g., Financial, Legal, Technical, General)"
      }

      Document Text:
      "${text.substring(0, 30000)}" // Truncate to avoid token limits for now if extremely large
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean up if model adds markdown formatting despite instructions
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating summary with Gemini:', error);
        throw new Error('Failed to generate document summary');
    }
}

module.exports = {
    generateDocumentSummary
};
