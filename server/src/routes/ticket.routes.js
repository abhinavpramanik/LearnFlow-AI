const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/:id/messages', ticketController.getTicketMessages);
router.post('/', ticketController.createTicket);
router.post('/:id/reply', ticketController.replyToTicket);
router.post('/:id/escalate', authorize('Service Agent', 'Admin'), ticketController.escalateTicket);
router.post('/:id/close', authorize('Service Agent', 'Admin'), ticketController.closeTicket);
router.post('/:id/assign', authorize('Admin', 'Service Agent'), ticketController.assignTicket);

module.exports = router;
