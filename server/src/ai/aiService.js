const { callGemini } = require('./geminiProvider');
const {
  intentPrompt,
  sentimentPrompt,
  summarizePrompt,
  nextBestActionPrompt,
  draftResponsePrompt,
  recommendationExplanationPrompt,
} = require('./prompts');
const AiRun = require('../models/AiRun');
const { AI_FEATURES } = require('../constants');

/**
 * Core AI execution pipeline:
 * build prompt → call Gemini → parse → store AiRun → return result
 */
const executeAI = async ({ feature, promptFn, inputData, actorId }) => {
  const prompt = promptFn(inputData);
  let status = 'success';
  let parsed;
  let latencyMs = 0;
  let promptVersion = '1.0';
  let modelVersion = 'gemini-3.5-flash';
  let systemPrompt = '';
  let errorMessage;

  try {
    const result = await callGemini(prompt);
    parsed = result.parsed;
    latencyMs = result.latencyMs;
    modelVersion = result.modelVersion;
  } catch (err) {
    status = 'failure';
    errorMessage = err.message;
    // Return structured error
    parsed = {
      result: 'AI service temporarily unavailable',
      confidence: 0,
      explanation: err.message,
      reviewRequired: false,
    };
  }

  // Always store AI run metadata
  const aiRun = await AiRun.create({
    feature,
    promptVersion: '1.0',
    modelVersion,
    inputSnapshot: inputData,
    output: parsed,
    confidence: parsed?.confidence || 0,
    latencyMs,
    status,
    errorMessage,
    createdBy: actorId,
  });

  return {
    ...parsed,
    modelVersion,
    timestamp: new Date().toISOString(),
    aiRunId: aiRun._id,
  };
};

// === Public AI methods ===

const classifyIntent = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.INTENT, promptFn: intentPrompt, inputData, actorId });

const analyzeSentiment = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.SENTIMENT, promptFn: sentimentPrompt, inputData, actorId });

const summarizeConversation = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.SUMMARIZE, promptFn: summarizePrompt, inputData, actorId });

const getNextBestAction = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.RECOMMEND, promptFn: nextBestActionPrompt, inputData, actorId });

const draftResponse = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.DRAFT, promptFn: draftResponsePrompt, inputData, actorId });

const explainRecommendation = (inputData, actorId) =>
  executeAI({ feature: AI_FEATURES.RECOMMEND, promptFn: recommendationExplanationPrompt, inputData, actorId });

module.exports = {
  classifyIntent,
  analyzeSentiment,
  summarizeConversation,
  getNextBestAction,
  draftResponse,
  explainRecommendation,
};
