const ticketService = require('../services/ticketService');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const getTickets = async (req, res, next) => {
  try {
    const { tickets, pagination } = await ticketService.getTickets(req.query, req.user);
    paginatedResponse(res, 'Tickets retrieved', tickets, pagination);
  } catch (err) { next(err); }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user);
    successResponse(res, 'Ticket retrieved', ticket);
  } catch (err) { next(err); }
};

const getTicketMessages = async (req, res, next) => {
  try {
    const messages = await ticketService.getTicketMessages(req.params.id);
    successResponse(res, 'Messages retrieved', messages);
  } catch (err) { next(err); }
};

const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user._id, req.ip);
    createdResponse(res, 'Ticket created successfully', ticket);
  } catch (err) { next(err); }
};

const replyToTicket = async (req, res, next) => {
  try {
    const msg = await ticketService.replyToTicket(req.params.id, req.body.message, req.user._id);
    createdResponse(res, 'Reply sent', msg);
  } catch (err) { next(err); }
};

const escalateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.escalateTicket(req.params.id, req.user._id, req.ip);
    successResponse(res, 'Ticket escalated', ticket);
  } catch (err) { next(err); }
};

const closeTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.closeTicket(req.params.id, req.user._id, req.ip);
    successResponse(res, 'Ticket closed', ticket);
  } catch (err) { next(err); }
};

const assignTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.assignTicket(req.params.id, req.body.agentId, req.user._id, req.ip);
    successResponse(res, 'Ticket assigned', ticket);
  } catch (err) { next(err); }
};

module.exports = { getTickets, getTicketById, getTicketMessages, createTicket, replyToTicket, escalateTicket, closeTicket, assignTicket };
