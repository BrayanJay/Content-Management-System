// Security configuration constants
export const SECURITY_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000,
  
  // Maximum login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Lockout duration in milliseconds (15 minutes)
  LOCKOUT_DURATION: 15 * 60 * 1000,
  
  // Minimum password requirements
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false
  },
  
  // Content Security Policy directives
  CSP_DIRECTIVES: {
    'default-src': "'self'",
    'img-src': "'self' data: https:",
    'style-src': "'self' 'unsafe-inline'",
    'script-src': "'self'",
    'connect-src': "'self' http://localhost:3000"
  },
  
  // Rate limiting
  RATE_LIMITS: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // limit each IP to 5 requests per windowMs
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // File upload restrictions
  FILE_UPLOAD: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFiles: 5
  },
  
  // Input validation patterns
  VALIDATION_PATTERNS: {
    username: /^[a-zA-Z0-9._-]{3,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    filename: /^[a-zA-Z0-9._-]+$/
  }
};

// Security headers for API requests
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Security utilities
export const SecurityUtils = {
  // Sanitize HTML input to prevent XSS
  sanitizeHtml: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  // Validate file type and size
  validateFile: (file) => {
    const errors = [];
    
    if (file.size > SECURITY_CONFIG.FILE_UPLOAD.maxSize) {
      errors.push(`File size exceeds ${SECURITY_CONFIG.FILE_UPLOAD.maxSize / 1024 / 1024}MB limit`);
    }
    
    if (!SECURITY_CONFIG.FILE_UPLOAD.allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Generate Content Security Policy header
  generateCSP: () => {
    return Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ');
  },
  
  // Check if session is expired
  isSessionExpired: (lastActivity) => {
    if (!lastActivity) return true;
    const now = new Date().getTime();
    const sessionAge = now - lastActivity;
    return sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT;
  },
  
  // Validate password strength
  validatePassword: (password) => {
    const { PASSWORD_REQUIREMENTS } = SECURITY_CONFIG;
    const errors = [];
    
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (PASSWORD_REQUIREMENTS.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password)
    };
  }
};

// Calculate password strength score (0-100)
function calculatePasswordStrength(password) {
  let score = 0;
  
  // Length bonus
  score += Math.min(password.length * 4, 25);
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  
  // Patterns penalty
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeating characters
  if (/123|abc|qwe/i.test(password)) score -= 15; // Common sequences
  
  return Math.max(0, Math.min(100, score));
}

export default { SECURITY_CONFIG, SECURITY_HEADERS, SecurityUtils };
