/**
 * Application-wide constants
 */

const ROLES = {
  CUSTOMER: 'Customer',
  SERVICE_AGENT: 'Service Agent',
  MARKETING_MANAGER: 'Marketing Manager',
  SALES_MANAGER: 'Sales Manager',
  ADMIN: 'Admin',
};

const TICKET_STATUS = {
  OPEN: 'Open',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  ESCALATED: 'Escalated',
  CLOSED: 'Closed',
};

const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const CAMPAIGN_STATUS = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const JOURNEY_STAGES = {
  ASSESSMENT: 'Assessment',
  LEARNING_PATH: 'Learning Path',
  COURSE: 'Course',
  PRACTICE: 'Practice',
  COACHING: 'Coaching',
  CERTIFICATION: 'Certification',
  WORKFORCE_PLANNING: 'Workforce Planning',
};

const RECOMMENDATION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  OVERRIDDEN: 'Overridden',
};

const NOTIFICATION_SEVERITY = {
  INFO: 'Info',
  WARNING: 'Warning',
  URGENT: 'Urgent',
  SYSTEM: 'System',
};

const AI_FEATURES = {
  INTENT: 'intent',
  SENTIMENT: 'sentiment',
  SUMMARIZE: 'summarize',
  RECOMMEND: 'recommend',
  DRAFT: 'draft',
};

const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

module.exports = {
  ROLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  CAMPAIGN_STATUS,
  JOURNEY_STAGES,
  RECOMMENDATION_STATUS,
  NOTIFICATION_SEVERITY,
  AI_FEATURES,
  USER_STATUS,
};
