export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : '';
}

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';

  return phone.replace(/[^0-9+]/g, '').slice(0, 15);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000000;
}

export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- Password hashing (Web Crypto API, SHA-256 + random salt) ---

async function sha256(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password with a random 16-byte salt.
 * Returns a string in the format `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hash = await sha256(salt + password);
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored `salt:hash` string.
 * Uses constant-length comparison to mitigate timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const separatorIndex = storedHash.indexOf(':');
  if (separatorIndex === -1) return false;

  const salt = storedHash.slice(0, separatorIndex);
  const originalHash = storedHash.slice(separatorIndex + 1);
  const candidateHash = await sha256(salt + password);

  // Constant-length comparison
  if (originalHash.length !== candidateHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < originalHash.length; i++) {
    mismatch |= originalHash.charCodeAt(i) ^ candidateHash.charCodeAt(i);
  }
  return mismatch === 0;
}
