import { z } from 'zod';
import { AppError } from '@/middleware/errorHandler';

// Custom Zod validators
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

export const chainSchema = z.enum(['ethereum', 'polygon', 'arbitrum', 'base']);

export const agentTypeSchema = z.enum(['writing', 'research', 'governance', 'butler']);

export const uintSchema = z.string().regex(/^\d+$/, 'Must be a valid unsigned integer');

export const addressOrValidate = (value: unknown): boolean => {
  try {
    addressSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const parseValidationError = (error: z.ZodError): string => {
  const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  return issues.join('; ');
};

export const validateOrThrow = <T>(schema: z.ZodSchema, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = parseValidationError(error);
      throw new AppError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
};
