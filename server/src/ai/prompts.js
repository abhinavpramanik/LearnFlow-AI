/**
 * AI Prompt Templates — v1.0
 * All prompts request JSON output and never expose chain-of-thought.
 */

const SYSTEM_CONTEXT = `You are an AI assistant for LearnFlow AI, an enterprise Corporate Learning & Development platform.
Your role is to support human decision-making. You never take autonomous actions.
Always respond with valid JSON only. Never include chain-of-thought. Never fabricate information.`;

const intentPrompt = ({ message, conversationHistory = [] }) => {
  const history = conversationHistory.map(m => `${m.direction}: ${m.message}`).join('\n');
  return `${SYSTEM_CONTEXT}

Analyze the following customer message and classify the intent.

${history ? `Previous conversation:\n${history}\n` : ''}
Latest message: "${message}"

Possible intents: Certificate Request, Course Assistance, Technical Issue, Coaching Request, Billing Query, General Inquiry, Complaint, Other.

Respond with ONLY this JSON:
{
  "result": "<intent>",
  "confidence": <0.0-1.0>,
  "explanation": "<brief reason>",
  "reviewRequired": false
}`;
};

const sentimentPrompt = ({ message }) => `${SYSTEM_CONTEXT}

Analyze the sentiment of this customer message: "${message}"

Respond with ONLY this JSON:
{
  "result": "<Positive|Neutral|Negative>",
  "confidence": <0.0-1.0>,
  "explanation": "<brief reason>",
  "reviewRequired": false
}`;

const summarizePrompt = ({ messages }) => {
  const conversation = messages.map(m => `[${m.sender?.firstName || 'User'}]: ${m.message}`).join('\n');
  return `${SYSTEM_CONTEXT}

Summarize the following support ticket conversation concisely. Highlight key issues, actions taken, and any pending items.

Conversation:
${conversation}

Respond with ONLY this JSON:
{
  "result": "<concise summary>",
  "confidence": 1.0,
  "explanation": "<key actions and pending items>",
  "reviewRequired": false
}`;
};

const nextBestActionPrompt = ({ profile, journey, recentInteractions }) => {
  return `${SYSTEM_CONTEXT}

Based on the learner profile and journey below, recommend the single most appropriate next action.

Profile: Department=${profile.department || 'N/A'}, Designation=${profile.designation || 'N/A'}
Journey stages completed: ${journey.map(j => j.stage).join(', ') || 'None'}
Recent interactions: ${recentInteractions.map(i => i.message).slice(0, 3).join(' | ') || 'None'}
Consent for AI recommendations: ${profile.consent?.aiRecommendations ? 'Yes' : 'No'}

Possible actions: Assign Course, Schedule Coaching, Send Reminder, Escalate Ticket, Issue Certificate, Follow Up.

IMPORTANT: If consent is No, return "No action — consent not given".

Respond with ONLY this JSON:
{
  "result": "<recommended action>",
  "confidence": <0.0-1.0>,
  "explanation": "<evidence-based reason>",
  "reviewRequired": true
}`;
};

const draftResponsePrompt = ({ ticket, profile, recentMessages }) => {
  const history = recentMessages.map(m => `${m.sender?.firstName || 'Agent'}: ${m.message}`).join('\n');
  return `${SYSTEM_CONTEXT}

Draft a professional customer support reply for the following ticket.

Ticket: "${ticket.title}"
Customer: ${profile?.userId?.firstName || 'Learner'}
Conversation so far:
${history}

Write a clear, professional, empathetic response suitable for the Learning & Development context.

Respond with ONLY this JSON:
{
  "result": "<drafted reply>",
  "confidence": <0.0-1.0>,
  "explanation": "Draft based on ticket context",
  "reviewRequired": true
}`;
};

const recommendationExplanationPrompt = ({ recommendation, profileContext }) => `${SYSTEM_CONTEXT}

Explain this AI recommendation in a clear, user-friendly way that helps a human reviewer make a decision.

Recommendation: "${recommendation.recommendation}"
Confidence: ${recommendation.confidence}
Profile context: ${JSON.stringify(profileContext)}

Respond with ONLY this JSON:
{
  "result": "<explanation>",
  "confidence": ${recommendation.confidence},
  "explanation": "<supporting evidence>",
  "reviewRequired": true
}`;

module.exports = {
  intentPrompt,
  sentimentPrompt,
  summarizePrompt,
  nextBestActionPrompt,
  draftResponsePrompt,
  recommendationExplanationPrompt,
};
