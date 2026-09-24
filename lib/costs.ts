// Set to true, and fill the "from" figures, only once Soda confirms real starting prices.
// While false, no price figure or budget band renders anywhere on the site.
export const COSTS_CONFIRMED = false;

export const COSTS = {
  holders: { from: null as number | null },
  brands: { from: null as number | null },
  budgetBands: [] as string[],
};

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}
