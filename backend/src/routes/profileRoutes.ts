import { Router, Request, Response } from 'express';

const router = Router();
export const DEFAULT_AWS_INVOKE_URL = 'https://o5skhjqub2.execute-api.us-east-1.amazonaws.com/Prod';

router.post('/profile/sync-aws', async (req: Request, res: Response) => {
  try {
    const rawBody = req.body || {};
    // Allow custom endpoint URL passed from request or fall back to default
    const targetUrl = (rawBody.endpoint || req.headers['x-aws-endpoint'] || DEFAULT_AWS_INVOKE_URL).toString().trim();
    const apiKey = (rawBody.apiKey || req.headers['x-api-key'] || '').toString().trim();

    // Extract pure profile payload
    const { endpoint, apiKey: _k, ...cleanPayload } = rawBody;

    console.log(`[Backend Proxy] Invoking AWS API Gateway: POST ${targetUrl}`);
    if (apiKey) {
      console.log(`[Backend Proxy] Using x-api-key: ${apiKey.substring(0, 4)}****`);
    }
    console.log(`[Backend Proxy] Payload:`, JSON.stringify(cleanPayload));

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (apiKey) {
      requestHeaders['x-api-key'] = apiKey;
    }

    const awsRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(cleanPayload),
    });

    const status = awsRes.status;
    let data: any = {};
    try {
      data = await awsRes.json();
    } catch {
      data = { rawText: await awsRes.text().catch(() => '') };
    }

    console.log(`[Backend Proxy] AWS API Gateway returned HTTP ${status}:`, data);

    res.status(status).json({
      success: awsRes.ok,
      awsStatus: status,
      targetUrl,
      data,
    });
  } catch (error: any) {
    console.error('[Backend Proxy] Error connecting to AWS API Gateway:', error);
    res.status(502).json({
      success: false,
      message: error?.message || 'Failed to invoke AWS endpoint',
    });
  }
});

export default router;
