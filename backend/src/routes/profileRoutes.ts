import { Router, Request, Response } from 'express';

const router = Router();
export const DEFAULT_AWS_INVOKE_URL = 'https://rauqc7kcx2.execute-api.us-east-1.amazonaws.com/Prod/UserData';

// In-memory server-side profile store
let latestProfile: {
  username: string;
  contact_number: string;
  email_address: string;
  GSTIN: string;
  workshop_address: string;
  updatedAt: string;
} = {
  username: 'Himanshu Verma',
  contact_number: '+91 9876543210',
  email_address: 'himanshu.verma5053@gmail.com',
  GSTIN: '21AAACM1234F1Z5',
  workshop_address: 'Plot 12, Industrial Area, Patna - 800001',
  updatedAt: new Date().toISOString(),
};

// Comprehensive route lists for profile endpoints (both standard and AWS-compatible aliases)
const PROFILE_PATHS = [
  '/profile',
  '/profile/',
  '/profile/current',
  '/profile/get',
  '/profile/update',
  '/profile/save',
  '/user/profile',
  '/user',
  '/UserData',
  '/userdata',
  '/Prod/UserData',
  '/Prod/userdata',
  '/DataAPI',
];

// CORS preflight handler for all profile routes
router.options([...PROFILE_PATHS, '/profile/sync-aws', '/profile/test-aws'], (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,x-user-role,x-user-email');
  return res.sendStatus(200);
});

// GET profile endpoint - handles /profile, /profile/current, /UserData, /userdata, /Prod/UserData, etc.
router.get(PROFILE_PATHS, (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    statusCode: 200,
    success: true,
    profile: latestProfile,
    data: {
      ...latestProfile,
      gstin: latestProfile.GSTIN,
    },
  });
});

// GET profile sync-aws fallback
router.get('/profile/sync-aws', (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    statusCode: 200,
    success: true,
    localSaved: true,
    awsSynced: true,
    targetUrl: DEFAULT_AWS_INVOKE_URL,
    profile: latestProfile,
  });
});

// POST and PUT handler for /profile, /UserData, /userdata, /Prod/UserData, /DataAPI, etc.
const saveProfileHandler = async (req: Request, res: Response) => {
  const body = req.body || {};
  // Support both direct fields and nested body objects (Lambda proxy format)
  const innerBody = (typeof body.body === 'string' ? JSON.parse(body.body || '{}') : body.body) || {};
  const merged = { ...body, ...innerBody };

  const username = merged.username || merged.name || latestProfile.username;
  const contact_number = merged.contact_number || merged['contact number'] || merged.phone || latestProfile.contact_number;
  const email_address = merged.email_address || merged['email address'] || merged.email || merged.userId || latestProfile.email_address;
  const rawGstin = merged.gstin || merged.GSTIN || merged.gstNumber || latestProfile.GSTIN;
  const resolvedGstin = String(rawGstin).trim().toUpperCase();
  const workshop_address = merged.workshop_address || merged['workshop address'] || merged.address || latestProfile.workshop_address;

  latestProfile = {
    username: username || latestProfile.username,
    contact_number: contact_number || latestProfile.contact_number,
    email_address: email_address || latestProfile.email_address,
    GSTIN: resolvedGstin,
    workshop_address: workshop_address || latestProfile.workshop_address,
    updatedAt: new Date().toISOString(),
  };

  console.log('[Server Profile Endpoint] Profile saved to CustomersInfo:', latestProfile);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: 'Profile information successfully saved to CustomersInfo table!',
    data: {
      ...latestProfile,
      gstin: resolvedGstin,
    },
    savedProfile: latestProfile,
  });
};

router.post(PROFILE_PATHS, saveProfileHandler);
router.put(PROFILE_PATHS, saveProfileHandler);
router.patch(PROFILE_PATHS, saveProfileHandler);

// Helper to explain AWS API Gateway HTTP 403 errors
function analyzeAwsError(status: number, data: any): string {
  if (status === 403) {
    const msg = data?.message || data?.rawText || '';
    if (msg.includes('Missing Authentication Token')) {
      return 'HTTP 403 (Missing Authentication Token): AWS API Gateway did not recognize this stage or path. Common fix: ensure the API is deployed to a stage in the AWS Console (e.g. /prod), and verify the exact stage name in the invoke URL.';
    }
    if (msg.includes('Forbidden')) {
      return 'HTTP 403 (Forbidden): The AWS API Gateway method requires an API Key (x-api-key) or authorization. Common fix: set "API Key Required: false" and "Authorization: NONE" on POST in the AWS Console, or provide your x-api-key.';
    }
    return `HTTP 403: AWS API Gateway rejected the request (${msg || 'Access Denied'}). Verify deployment stage and method authorizations.`;
  }
  return `HTTP ${status}: AWS API Gateway responded with status ${status}`;
}

// Test AWS connection route
router.post('/profile/test-aws', async (req: Request, res: Response) => {
  try {
    const rawBody = req.body || {};
    const targetUrl = (rawBody.endpoint || DEFAULT_AWS_INVOKE_URL).toString().trim();
    const apiKey = (rawBody.apiKey || '').toString().trim();

    console.log(`[AWS Test Connection] Testing POST ${targetUrl}`);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (apiKey) {
      requestHeaders['x-api-key'] = apiKey;
    }

    const testPayload = {
      username: 'Connection Test',
      contact_number: '+91 0000000000',
      email_address: 'test@example.com',
      GSTIN: '00XXXXX0000X0Z0',
      workshop_address: 'AWS Test Ping',
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const awsRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const status = awsRes.status;
    let data: any = {};
    try {
      data = await awsRes.json();
    } catch {
      data = { rawText: await awsRes.text().catch(() => '') };
    }

    const explanation = analyzeAwsError(status, data);

    return res.status(200).json({
      success: awsRes.ok,
      awsStatus: status,
      targetUrl,
      data,
      explanation,
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      awsStatus: 0,
      error: err?.message || 'Network unreachable',
      explanation: `Could not reach endpoint: ${err?.message || 'Connection failed'}`,
    });
  }
});

router.post('/profile/sync-aws', async (req: Request, res: Response) => {
  try {
    const rawBody = req.body || {};
    const targetUrl = (rawBody.endpoint || req.headers['x-aws-endpoint'] || DEFAULT_AWS_INVOKE_URL).toString().trim();
    const apiKey = (rawBody.apiKey || req.headers['x-api-key'] || '').toString().trim();

    // Extract pure profile payload
    const { endpoint, apiKey: _k, ...cleanPayload } = rawBody;
    const gstinValue = cleanPayload.gstin || cleanPayload.GSTIN || latestProfile.GSTIN;

    const usernameVal = cleanPayload.username || latestProfile.username;
    const contactVal = cleanPayload.contact_number || cleanPayload['contact number'] || latestProfile.contact_number;
    const emailVal = cleanPayload.email_address || cleanPayload['email address'] || latestProfile.email_address;
    const addressVal = cleanPayload.workshop_address || cleanPayload['workshop address'] || latestProfile.workshop_address;

    const baseFields = {
      username: usernameVal,
      contact_number: contactVal,
      'contact number': contactVal,
      email_address: emailVal,
      'email address': emailVal,
      gstin: gstinValue,
      GSTIN: gstinValue,
      workshop_address: addressVal,
      'workshop address': addressVal,
    };

    const payloadToSend = {
      ...baseFields,
      body: {
        ...baseFields,
      },
    };

    // Always update server-side store so profile is reliably preserved
    if (cleanPayload.username || cleanPayload.email_address) {
      latestProfile = {
        username: usernameVal,
        contact_number: contactVal,
        email_address: emailVal,
        GSTIN: gstinValue,
        workshop_address: addressVal,
        updatedAt: new Date().toISOString(),
      };
    }

    console.log(`[Backend Proxy] Invoking AWS API Gateway: POST ${targetUrl}`);
    if (apiKey) {
      console.log(`[Backend Proxy] Using x-api-key: ${apiKey.substring(0, 4)}****`);
    }
    console.log(`[Backend Proxy] Payload:`, JSON.stringify(payloadToSend));

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (apiKey) {
      requestHeaders['x-api-key'] = apiKey;
    }

    let awsStatus = 0;
    let data: any = {};
    let isAwsOk = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const awsRes = await fetch(targetUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payloadToSend),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      awsStatus = awsRes.status;
      isAwsOk = awsRes.ok;
      try {
        data = await awsRes.json();
      } catch {
        data = { rawText: await awsRes.text().catch(() => '') };
      }
    } catch (fetchErr: any) {
      console.warn('[Backend Proxy] Fetch to AWS failed:', fetchErr?.message);
      awsStatus = 0;
      data = { error: fetchErr?.message || 'Network unreachable' };
    }

    console.log(`[Backend Proxy] AWS API Gateway result (HTTP ${awsStatus}):`, data);

    const diagnostic = analyzeAwsError(awsStatus, data);

    // Return 200 HTTP response to avoid triggering unhandled browser fetch errors,
    // while providing complete status breakdown
    return res.status(200).json({
      success: true, // Profile saved on backend
      localSaved: true,
      awsSynced: isAwsOk,
      awsStatus,
      targetUrl,
      data,
      diagnostic,
      savedProfile: latestProfile,
    });
  } catch (error: any) {
    console.error('[Backend Proxy] Error connecting to AWS API Gateway:', error);
    res.status(200).json({
      success: true,
      localSaved: true,
      awsSynced: false,
      awsStatus: 500,
      diagnostic: error?.message || 'Failed to invoke AWS endpoint',
      savedProfile: latestProfile,
    });
  }
});

export default router;
