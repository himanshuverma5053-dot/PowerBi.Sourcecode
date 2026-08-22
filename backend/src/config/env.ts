import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AWS: {
    REGION: process.env.AWS_REGION || 'ap-south-1',
    USER_POOL_ID: process.env.AWS_USER_POOL_ID || '',
    USER_POOL_CLIENT_ID: process.env.AWS_USER_POOL_CLIENT_ID || '',
    APPSYNC_ENDPOINT: process.env.AWS_APPSYNC_GRAPHQL_ENDPOINT || '',
    APPSYNC_API_KEY: process.env.AWS_APPSYNC_API_KEY || '',
    TABLE_PREFIX: process.env.AWS_DYNAMODB_TABLE_PREFIX || 'magadh_tyres_'
  }
};
