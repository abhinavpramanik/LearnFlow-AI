const { z } = require('zod');

const createUserSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Uppercase required')
    .regex(/[a-z]/, 'Lowercase required')
    .regex(/[0-9]/, 'Number required')
    .regex(/[^A-Za-z0-9]/, 'Special character required'),
  role: z.enum(['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin']),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  role: z.enum(['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Suspended']),
});

module.exports = { createUserSchema, updateUserSchema, updateStatusSchema };
