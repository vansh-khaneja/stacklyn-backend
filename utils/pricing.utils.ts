import modelPricing from "../config/model-pricing.json";

interface ModelPrice {
  input: number;
  output: number;
}

interface PricingConfig {
  prices: Record<string, ModelPrice>;
  default: ModelPrice;
}

const pricing = modelPricing as PricingConfig;

export const getModelPrice = (modelName: string): ModelPrice => {
  // Try exact match first
  if (pricing.prices[modelName]) {
    return pricing.prices[modelName];
  }

  // Try partial match (model name might have version suffixes)
  const matchingKey = Object.keys(pricing.prices).find(
    (key) => modelName.includes(key) || key.includes(modelName)
  );

  if (matchingKey) {
    return pricing.prices[matchingKey];
  }

  return pricing.default;
};

export const calculateCost = (
  modelName: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const price = getModelPrice(modelName);

  // Price is per million tokens
  const inputCost = (inputTokens / 1_000_000) * price.input;
  const outputCost = (outputTokens / 1_000_000) * price.output;

  // Return cost rounded to 6 decimal places
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
};
