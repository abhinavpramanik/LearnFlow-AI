const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Profile = require('../models/Profile');
const { auditLog } = require('./auditService');
const { NotFoundError, AuthorizationError, BusinessRuleError } = require('../utils/errors');
const { ROLES, TICKET_STATUS, NOTIFICATION_SEVERITY } = require('../constants');

const getPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { page, limit, skip: (page - 1) * limit };
};

const getTickets = async (query, requestingUser) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};
  const roleName = requestingUser.role?.name;

  if (roleName === ROLES.CUSTOMER) filter.createdBy = requestingUser._id;
  else if (roleName === ROLES.SERVICE_AGENT) filter.assignedAgent = requestingUser._id;

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedAgent', 'firstName lastName email')
      .populate('profileId', '_id')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    Ticket.countDocuments(filter),
  ]);
  return { tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const getTicketById = async (id, requestingUser) => {
  const ticket = await Ticket.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedAgent', 'firstName lastName email')
    .populate('profileId');
  if (!ticket) throw new NotFoundError('Ticket not found');

  const roleName = requestingUser.role?.name;
  if (roleName === ROLES.CUSTOMER && ticket.createdBy._id.toString() !== requestingUser._id.toString()) {
    throw new AuthorizationError('Access denied');
  }
  return ticket;
};

const getTicketMessages = async (ticketId) => {
  return Message.find({ ticketId }).populate('sender', 'firstName lastName').sort({ createdAt: 1 });
};

const createTicket = async (data, actorId, ipAddress) => {
  const profile = await Profile.findOne({ userId: actorId });
  if (!profile) throw new BusinessRuleError('User profile not found. Cannot create ticket.');

  const ticket = await Ticket.create({ 
    ...data, 
    createdBy: actorId, 
    profileId: profile._id,
    status: TICKET_STATUS.OPEN 
  });
  await auditLog({ actor: actorId, action: 'tickets:create', entity: 'Ticket', entityId: ticket._id, outcome: 'success', ipAddress });
  return ticket;
};

const replyToTicket = async (ticketId, message, actorId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.status === TICKET_STATUS.CLOSED) throw new BusinessRuleError('Cannot reply to a closed ticket');
  const msg = await Message.create({ ticketId, sender: actorId, message });
  if (ticket.status === TICKET_STATUS.OPEN) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
    await ticket.save();
  }
  return msg;
};

const escalateTicket = async (ticketId, actorId, ipAddress) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new NotFoundError('Ticket not found');
  ticket.status = TICKET_STATUS.ESCALATED;
  ticket.escalatedAt = new Date();
  ticket.escalatedBy = actorId;
  await ticket.save();
  await auditLog({ actor: actorId, action: 'tickets:escalate', entity: 'Ticket', entityId: ticketId, outcome: 'success', ipAddress });
  return ticket;
};

const closeTicket = async (ticketId, actorId, ipAddress) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new NotFoundError('Ticket not found');
  ticket.status = TICKET_STATUS.CLOSED;
  ticket.closedAt = new Date();
  ticket.closedBy = actorId;
  await ticket.save();
  await auditLog({ actor: actorId, action: 'tickets:close', entity: 'Ticket', entityId: ticketId, outcome: 'success', ipAddress });

  // Notify ticket owner
  await Notification.create({
    userId: ticket.createdBy,
    title: 'Ticket Closed',
    body: `Your ticket "${ticket.title}" has been closed.`,
    severity: NOTIFICATION_SEVERITY.INFO,
    entityType: 'Ticket',
    entityId: ticketId,
  });
  return ticket;
};

const assignTicket = async (ticketId, agentId, actorId, ipAddress) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new NotFoundError('Ticket not found');
  ticket.assignedAgent = agentId;
  if (ticket.status === TICKET_STATUS.OPEN) ticket.status = TICKET_STATUS.PENDING;
  await ticket.save();
  await auditLog({ actor: actorId, action: 'tickets:assign', entity: 'Ticket', entityId: ticketId, outcome: 'success', ipAddress });
  return ticket;
};

module.exports = { getTickets, getTicketById, getTicketMessages, createTicket, replyToTicket, escalateTicket, closeTicket, assignTicket };
