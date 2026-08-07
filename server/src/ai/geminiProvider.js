const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Calls the Gemini API with retry logic for transient failures.
 * Returns parsed JSON from the model's response.
 */
const callGemini = async (prompt, modelName = 'gemini-1.5-flash', maxRetries = 3) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: modelName });

  let lastError;
  const delays = [1000, 2000, 5000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const latencyMs = Date.now() - startTime;

      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error(`Gemini returned invalid JSON: ${jsonText.substring(0, 200)}`);
      }

      return { parsed, latencyMs, modelVersion: modelName };
    } catch (err) {
      lastError = err;

      // Don't retry validation failures or JSON parse errors
      if (err.message?.includes('invalid JSON') || attempt === maxRetries - 1) {
        break;
      }

      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }

  throw lastError;
};

module.exports = { callGemini };
