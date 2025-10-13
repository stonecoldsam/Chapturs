// Environment configuration and validation
export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    googleId: process.env.AUTH_GOOGLE_ID,
    googleSecret: process.env.AUTH_GOOGLE_SECRET,
    secret: process.env.AUTH_SECRET,
  },
  // Add other config as needed
};

// Critical environment variables (required at runtime)
const criticalEnvVars = [
  'DATABASE_URL',
  'AUTH_SECRET',
];

// Optional environment variables (Google OAuth is optional)
const optionalEnvVars = [
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
];

/**
 * Validate environment variables
 * Only validates in production runtime, not during build
 */
export function validateEnvironment() {
  // Skip validation during build process
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const missing = criticalEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('⚠️  Application may not function correctly without these variables.');
    // Don't throw during validation - let the app start and fail gracefully when needed
  }
}