import { z } from 'zod';

const threatLevels = ['low', 'medium', 'high'] as const;
const statuses = ['active', 'mitigated', 'dismissed'] as const;

export const createDroneSchema = z.object({
  label: z
    .string({ message: '"label" is required and must be a string' })
    .min(1, '"label" must not be empty')
    .max(100, '"label" must be 100 characters or fewer'),
  threatLevel: z.enum(threatLevels, {
    message: `"threatLevel" must be one of: ${threatLevels.join(', ')}`,
  }),
});

export const updateDroneSchema = z.object({
  status: z.enum(['mitigated', 'dismissed'] as const, {
    message: '"status" must be "mitigated" or "dismissed" — "active" is not a valid transition',
  }),
});

export const listDroneQuerySchema = z.object({
  status: z
    .enum(statuses, { message: `"status" must be one of: ${statuses.join(', ')}` })
    .optional(),
  threatLevel: z
    .enum(threatLevels, { message: `"threatLevel" must be one of: ${threatLevels.join(', ')}` })
    .optional(),
  page: z.coerce
    .number({ message: '"page" must be a number' })
    .int('"page" must be an integer')
    .positive('"page" must be ≥ 1')
    .default(1),
  limit: z.coerce
    .number({ message: '"limit" must be a number' })
    .int('"limit" must be an integer')
    .positive('"limit" must be ≥ 1')
    .max(100, '"limit" must be ≤ 100')
    .default(20),
});

export type CreateDroneInput = z.infer<typeof createDroneSchema>;
export type UpdateDroneInput = z.infer<typeof updateDroneSchema>;
export type ListDroneQuery = z.infer<typeof listDroneQuerySchema>;
