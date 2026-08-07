
# Phase 5 – Gemini AI System Design
## AI Customer Journey Orchestrator (Corporate Learning)

> **Purpose:** This document defines how Google Gemini is integrated into the platform. AI acts as a decision-support system and never performs sensitive business actions automatically. All AI calls originate from the backend and are auditable.

---

# 1. AI Design Principles

- AI assists, humans decide.
- Never expose Gemini API key.
- Never expose chain-of-thought.
- Every AI response must be traceable.
- Store AI execution metadata.
- Allow reviewer approval for high-impact outputs.

---

# 2. AI Technology

- Provider: Google Gemini API
- Invocation: Backend only
- API Key: `.env`
- Service Layer: `AIService`

Frontend must never call Gemini directly.

---

# 3. AI Architecture

```text
React UI
   |
Express API
   |
AI Controller
   |
AI Service
   |
Prompt Builder
   |
Gemini API
   |
Parser
   |
Confidence & Metadata
   |
MongoDB (aiRuns)
```

---

# 4. AI Capabilities

Implement the following features:

1. Intent Classification
2. Sentiment Analysis
3. Conversation Summarization
4. Next Best Action (NBA)
5. Response Drafting
6. Recommendation Explanation

---

# 5. Intent Classification

## Purpose

Understand what the customer wants.

Examples

- Certificate Request
- Course Assistance
- Technical Issue
- Coaching Request
- General Inquiry

### Input

- Latest message
- Previous conversation (optional)

### Output

```json
{
  "intent":"Certificate Request",
  "confidence":0.94,
  "reason":"User requested certificate generation."
}
```

---

# 6. Sentiment Analysis

Purpose

Determine customer emotion.

Supported values

- Positive
- Neutral
- Negative

Output

- sentiment
- confidence
- explanation

---

# 7. Conversation Summarization

Purpose

Summarize long conversations.

Input

- Ticket history
- Chat messages

Output

- concise summary
- important events
- pending actions

Maximum summary should remain concise and readable.

---

# 8. Next Best Action

Purpose

Recommend the most appropriate next action.

Possible actions

- Assign Course
- Schedule Coaching
- Send Reminder
- Escalate Ticket
- Issue Certificate
- Follow Up

Business Rules

- Respect consent.
- Respect eligibility.
- Respect frequency caps.
- Never trigger automatically.

---

# 9. Response Drafting

Purpose

Generate customer support replies.

Inputs

- Ticket
- Customer profile
- Journey context

Output

Professional response suitable for email/chat.

Human approval required before sending.

---

# 10. Recommendation Explanation

Every recommendation must include:

- Why it was generated
- Supporting data
- Confidence
- Timestamp
- Model version

Never expose internal reasoning.

---

# 11. Prompt Strategy

Prompt Template

System Context

- You are assisting an enterprise learning platform.
- Follow company policies.
- Produce structured JSON.
- Never fabricate missing information.

User Context

- Profile
- Journey
- Ticket
- Consent
- Previous interactions

Task

- Perform requested AI operation.

---

# 12. Standard Output Schema

```json
{
 "result":"",
 "confidence":0.92,
 "explanation":"",
 "modelVersion":"",
 "timestamp":"",
 "reviewRequired":true
}
```

---

# 13. AI Workflow

Request

↓

Validate Input

↓

Build Prompt

↓

Call Gemini

↓

Parse Response

↓

Validate JSON

↓

Store aiRuns

↓

Return Response

↓

Optional Human Approval

---

# 14. AI Approval Workflow

Required for:

- Next Best Action
- Draft Replies
- High-impact Recommendations

Flow

AI Output

↓

Reviewer

↓

Approve

Reject

Override

↓

Audit Log

---

# 15. Prompt Engineering Guidelines

- Keep prompts deterministic.
- Request JSON output.
- Include business context.
- Avoid unnecessary verbosity.
- Limit hallucinations by providing source context.
- Never request hidden reasoning.

---

# 16. Error Handling

Handle

- Timeout
- Invalid JSON
- API failure
- Empty response
- Rate limit

Fallback

Return structured error and log execution.

---

# 17. Retry Strategy

Retry only transient failures.

Maximum retries: 3

Backoff

1s

2s

5s

Do not retry validation failures.

---

# 18. AI Logging

Store in `aiRuns`

- feature
- promptVersion
- modelVersion
- inputSnapshot
- output
- latency
- confidence
- status
- createdAt

Exclude secrets and sensitive credentials.

---

# 19. Model Versioning

Track

- Gemini model
- Prompt version
- Schema version

Older executions must remain reproducible for audit.

---

# 20. Security & Privacy

- Backend-only API access
- Sanitize inputs
- Remove secrets before prompts
- Respect consent settings
- Minimize personal data in prompts
- Encrypt data in transit

---

# 21. Performance

- Cache repeatable static analyses where appropriate.
- Limit prompt size.
- Trim historical context.
- Process long conversations into summaries before analysis.

---

# 22. Future AI Extensions

- Skill-gap recommendations
- Personalized learning paths
- Predictive workforce planning
- Multi-language support
- Voice interaction
- RAG using enterprise knowledge base

---

# 23. Acceptance Criteria

AI integration is complete when:

- All required AI features work.
- Responses are structured.
- Metadata is stored.
- Approval workflow functions.
- Audit logs exist.
- Failures are handled gracefully.

---

# 24. Antigravity Notes

- Create a dedicated `AIService`.
- Centralize prompt templates.
- Never hardcode prompts in controllers.
- Validate AI JSON before returning.
- Keep AI provider swappable.
- Separate prompt building, API calling, parsing, and persistence into independent modules.
