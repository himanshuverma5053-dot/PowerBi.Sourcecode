import { TyreProduct, CustomerAccount } from '../types';

export const DEFAULT_CUSTOMER_ACCOUNTS: CustomerAccount[] = [];

export function getCustomerEffectivePrice(
  product: TyreProduct,
  customer?: CustomerAccount | null
): {
  effectivePrice: number;
  basePrice: number;
  pricingLabel: string;
  hasCustomOverride: boolean;
  appliedDiscountPercent: number;
} {
  if (!customer) {
    const defaultPrice = product.dealerPrice || product.price;
    return {
      effectivePrice: defaultPrice,
      basePrice: defaultPrice,
      pricingLabel: 'Dealer Price',
      hasCustomOverride: false,
      appliedDiscountPercent: 0
    };
  }

  const override = customer.productOverrides?.[product.id];
  let basePrice = product.dealerPrice || product.price;
  let pricingLabel = 'GST / Dealer Price';
  let hasCustomOverride = false;

  // 1. Check pricing type setting
  if (customer.pricingType === 'credit') {
    basePrice = product.bulkPrice || product.dealerPrice || product.price;
    pricingLabel = 'Credit Pricing';
  } else if (customer.pricingType === 'gst') {
    basePrice = product.dealerPrice || product.price;
    pricingLabel = 'GST Dealer Price';
  } else if (customer.pricingType === 'custom') {
    pricingLabel = 'Custom Pricing';
  }

  // 2. HIGHEST PRIORITY: Specific product custom price override
  if (override && typeof override.customPrice === 'number' && override.customPrice > 0) {
    basePrice = override.customPrice;
    hasCustomOverride = true;
    pricingLabel = 'Customer Custom Price';
  }

  let finalPrice = basePrice;

  // 3. Apply product-specific discount if any
  if (override?.discountPercent && override.discountPercent > 0) {
    finalPrice = finalPrice * (1 - override.discountPercent / 100);
  }
  if (override?.discountFlat && override.discountFlat > 0) {
    finalPrice = Math.max(0, finalPrice - override.discountFlat);
  }

  // 4. Apply customer-level overall discount %
  const overallDisc = customer.overallDiscountPercent || 0;
  if (overallDisc > 0) {
    finalPrice = finalPrice * (1 - overallDisc / 100);
  }

  const roundedEffectivePrice = Math.round(finalPrice);
  const totalDiscountPercent = override?.discountPercent || overallDisc || 0;

  return {
    effectivePrice: roundedEffectivePrice,
    basePrice,
    pricingLabel,
    hasCustomOverride,
    appliedDiscountPercent: totalDiscountPercent
  };
}

export function isProductVisibleToCustomer(
  product: TyreProduct,
  customer?: CustomerAccount | null
): boolean {
  if (!customer) return true;

  // Check explicit exclusion override
  const override = customer.productOverrides?.[product.id];
  if (override?.isExcluded) {
    return false;
  }

  // Check selected products mode
  if (customer.productVisibilityMode === 'selected') {
    if (!customer.allowedProductIds || !customer.allowedProductIds.includes(product.id)) {
      return false;
    }
  }

  return true;
}
