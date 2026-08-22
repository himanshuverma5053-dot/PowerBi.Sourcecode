import { Request, Response } from 'express';
import { generateTyreAdvice } from '../services/aiAdvisorService.js';

export async function getTyreAdvice(req: Request, res: Response) {
  try {
    const result = await generateTyreAdvice(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate tyre advice.',
      recommendedTyres: []
    });
  }
}
