import { Router, Request, Response } from 'express';

const router = Router();
const AWS_INVOKE_URL = 'https://o5skhjqub2.execute-api.us-east-1.amazonaws.com/prod';

router.post('/profile/sync-aws', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const awsRes = await fetch(AWS_INVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const status = awsRes.status;
    let data: any = {};
    try {
      data = await awsRes.json();
    } catch {
      data = { rawText: await awsRes.text().catch(() => '') };
    }

    res.status(status).json({
      success: awsRes.ok,
      awsStatus: status,
      data,
    });
  } catch (error: any) {
    console.error('Proxy to AWS API Gateway error:', error);
    res.status(502).json({
      success: false,
      message: error?.message || 'Failed to invoke AWS endpoint',
    });
  }
});

export default router;
