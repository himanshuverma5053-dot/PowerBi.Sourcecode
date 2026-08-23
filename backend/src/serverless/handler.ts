import { createApp } from '../app.js';

interface APIGatewayEventLike {
  httpMethod: string;
  path: string;
  queryStringParameters?: Record<string, string> | null;
  headers?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
}

interface APIGatewayResultLike {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

let cachedApp: any = null;

function safeParse(str?: string | null) {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

/**
 * AWS Lambda Serverless API Gateway Proxy Handler
 */
export const handler = async (
  event: APIGatewayEventLike,
  context: any
): Promise<APIGatewayResultLike> => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  // Lazy initialize express application
  if (!cachedApp) {
    cachedApp = createApp();
  }

  // Map APIGateway event to Express-compatible request/response
  return new Promise((resolve) => {
    const { httpMethod, path, queryStringParameters, headers, body, isBase64Encoded } = event;

    const queryStr = queryStringParameters
      ? '?' + new URLSearchParams(queryStringParameters as Record<string, string>).toString()
      : '';

    const reqBody = isBase64Encoded && body ? Buffer.from(body, 'base64').toString('utf8') : body;

    const mockReq: any = {
      method: httpMethod,
      url: `${path}${queryStr}`,
      originalUrl: `${path}${queryStr}`,
      headers: headers || {},
      body: safeParse(reqBody),
      query: queryStringParameters || {},
      params: {}
    };

    const resHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-user-role,x-user-email,x-admin-console',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json'
    };

    let responseBody = '';
    let statusCode = 200;

    const mockRes: any = {
      setHeader(key: string, val: string) {
        resHeaders[key] = val;
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseBody = JSON.stringify(data);
        resolve({
          statusCode,
          headers: resHeaders,
          body: responseBody
        });
      },
      send(data: any) {
        responseBody = typeof data === 'string' ? data : JSON.stringify(data);
        resolve({
          statusCode,
          headers: resHeaders,
          body: responseBody
        });
      },
      end() {
        resolve({
          statusCode,
          headers: resHeaders,
          body: responseBody
        });
      }
    };

    try {
      cachedApp(mockReq, mockRes);
    } catch (err: any) {
      resolve({
        statusCode: 500,
        headers: resHeaders,
        body: JSON.stringify({ success: false, message: err.message || 'Lambda execution error' })
      });
    }
  });
};
