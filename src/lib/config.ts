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

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
  'AUTH_SECRET',
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}