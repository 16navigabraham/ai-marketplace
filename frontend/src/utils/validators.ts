/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  return true;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
}

/**
 * Validate integer
 */
export function isInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && Number.isInteger(num);
}

/**
 * Validate number within range
 */
export function isInRange(value: string | number, min: number, max: number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate string length
 */
export function isValidLength(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  if (!value) return false;
  return value.length >= minLength && value.length <= maxLength;
}

/**
 * Validate agent name
 */
export function isValidAgentName(name: string): boolean {
  if (!name) return false;
  return isValidLength(name, 3, 50) && /^[a-zA-Z0-9\s\-_.]+$/.test(name);
}

/**
 * Validate agent description
 */
export function isValidDescription(description: string): boolean {
  if (!description) return false;
  return isValidLength(description, 10, 500);
}

/**
 * Validate agent type
 */
export function isValidAgentType(
  type: string
): type is 'writing' | 'research' | 'governance' | 'butler' {
  return ['writing', 'research', 'governance', 'butler'].includes(type);
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate trade amount
 */
export function isValidTradeAmount(
  amount: string | number,
  maxAmount?: string | number
): boolean {
  if (!isPositiveNumber(amount)) return false;

  if (maxAmount !== undefined) {
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    const maxNum = typeof maxAmount === 'string' ? parseFloat(maxAmount) : maxAmount;
    return amountNum <= maxNum;
  }

  return true;
}

/**
 * Create validation error message
 */
export function getValidationError(field: string, type: string): string {
  const errors: Record<string, Record<string, string>> = {
    address: {
      invalid: 'Invalid Ethereum address',
      required: 'Address is required',
    },
    email: {
      invalid: 'Invalid email format',
      required: 'Email is required',
    },
    url: {
      invalid: 'Invalid URL format',
      required: 'URL is required',
    },
    agentName: {
      invalid: 'Agent name must be 3-50 characters and contain only letters, numbers, spaces, hyphens, underscores, and periods',
      required: 'Agent name is required',
    },
    description: {
      invalid: 'Description must be 10-500 characters',
      required: 'Description is required',
    },
    amount: {
      invalid: 'Amount must be a positive number',
      required: 'Amount is required',
      exceeds: 'Amount exceeds available balance',
    },
    agentType: {
      invalid: 'Invalid agent type',
      required: 'Agent type is required',
    },
  };

  return errors[field]?.[type] || `${field} is invalid`;
}

/**
 * Validate form submission
 */
export function validateAgentForm(data: {
  name: string;
  description: string;
  type: string;
  creatorAddress: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name) {
    errors.name = getValidationError('agentName', 'required');
  } else if (!isValidAgentName(data.name)) {
    errors.name = getValidationError('agentName', 'invalid');
  }

  if (!data.description) {
    errors.description = getValidationError('description', 'required');
  } else if (!isValidDescription(data.description)) {
    errors.description = getValidationError('description', 'invalid');
  }

  if (!data.type) {
    errors.type = getValidationError('agentType', 'required');
  } else if (!isValidAgentType(data.type)) {
    errors.type = getValidationError('agentType', 'invalid');
  }

  if (!data.creatorAddress) {
    errors.creatorAddress = getValidationError('address', 'required');
  } else if (!isValidAddress(data.creatorAddress)) {
    errors.creatorAddress = getValidationError('address', 'invalid');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate trade form
 */
export function validateTradeForm(data: {
  amount: string;
  maxAmount: string;
  price?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.amount) {
    errors.amount = getValidationError('amount', 'required');
  } else if (!isValidTradeAmount(data.amount, data.maxAmount)) {
    errors.amount = getValidationError('amount', 'exceeds');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
