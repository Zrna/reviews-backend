/**
 * Validates that all required environment variables are present
 * Throws an error if any required variable is missing
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_DIALECT',
    'DB_PORT',
    'NODE_ENV',
    'PORT',
    'TOKEN_SECRET',
    'OMDB_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !(varName in process.env));

  // In production, DB_PASSWORD cannot be empty
  if (process.env.NODE_ENV === 'production' && !process.env.DB_PASSWORD) {
    throw new Error(
      'DB_PASSWORD cannot be empty in production.\n' + 'Please set a secure database password in your .env file.'
    );
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }

  console.log('✓ Environment variables validated successfully');
};

module.exports = { validateEnv };
