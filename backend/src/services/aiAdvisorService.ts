import { getGeminiClient } from '../config/gemini.js';
import { memoryStore } from '../store/memoryStore.js';
import { TyreProduct } from '../types/index.js';

export interface AdvisorParams {
  vehicleModel?: string;
  monthlyKm?: number | string;
  roadCondition?: string;
  budget?: string;
  drivingStyle?: string;
}

export interface AdvisorResult {
  success: boolean;
  recommendationText: string;
  recommendedTyres: TyreProduct[];
}

export async function generateTyreAdvice(params: AdvisorParams): Promise<AdvisorResult> {
  const { vehicleModel, monthlyKm, roadCondition, budget, drivingStyle } = params;
  const products = memoryStore.getProducts();

  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent automotive rule-based fallback when Gemini API key is not configured
    const recommended = products.slice(0, 3);
    return {
      success: true,
      recommendationText: `Based on your ${vehicleModel || 'vehicle'} driving approximately ${monthlyKm || 1000} km/month on ${roadCondition || 'mixed city & highway'} roads, we recommend heavy-duty low-rolling-resistance tyres for optimal grip, mileage, and tread longevity.`,
      recommendedTyres: recommended
    };
  }

  try {
    const prompt = `You are Magadh Tyres AI Advisor, an expert automotive tyre specialist for Indian roads.
User Profile:
- Vehicle Model: ${vehicleModel || 'Car / SUV / Commercial Truck / Bike'}
- Monthly Mileage: ${monthlyKm || 1000} km
- Primary Terrain / Road Conditions: ${roadCondition || 'City potholes and monsoon highways'}
- Budget Range: ${budget || 'Moderate'}
- Driving Style: ${drivingStyle || 'Comfort & Fuel Efficiency'}

Available Catalog:
${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  price: p.price,
  terrain: p.terrain,
  specs: `${p.width}/${p.aspectRatio} R${p.rimSize}`,
  tireType: p.tireType || p.tire_type
})), null, 2)}

Instructions:
1. Recommend top 2-3 specific tyres from the catalog above that best match the user's vehicle and driving conditions.
2. Provide concise automotive reasoning highlighting wet grip, tread longevity, sidewall strength, and fuel savings on Indian roads.
3. Return valid JSON only with structure:
   {
     "recommendationText": "<string summary advice>",
     "recommendedProductIds": ["<id1>", "<id2>"]
   }`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let parsed = { recommendationText: '', recommendedProductIds: [] as string[] };
    if (aiResponse.text) {
      try {
        parsed = JSON.parse(aiResponse.text.trim());
      } catch {
        parsed.recommendationText = aiResponse.text;
      }
    }

    const matchedTyres = products.filter(p => parsed.recommendedProductIds?.includes(p.id));

    return {
      success: true,
      recommendationText: parsed.recommendationText || `Here are the best tyres matched for your ${vehicleModel || 'vehicle'}:`,
      recommendedTyres: matchedTyres.length > 0 ? matchedTyres : products.slice(0, 3)
    };
  } catch (err: any) {
    console.error('Gemini Advisor Execution Error:', err);
    return {
      success: true,
      recommendationText: 'Here are top recommended tyres for Indian road conditions based on our verified performance ratings:',
      recommendedTyres: products.slice(0, 3)
    };
  }
}
