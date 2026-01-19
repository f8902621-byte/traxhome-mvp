// ==============================================
// KTRIX – Opportunity Score (KOS)
// Version 1.0 – Statistical, non-predictive
// ==============================================

export function computeKOS(item, avgPricePerM2, districtStats) {
  let score = 0;

  // (logique simplifiée pour l’instant)
  if (item.price && item.area && avgPricePerM2) {
    const pricePerM2 = item.price / item.area;
    if (pricePerM2 < avgPricePerM2 * 0.85) score += 40;
    else if (pricePerM2 < avgPricePerM2) score += 20;
  }

  // Clamp 0 → 100
  score = Math.max(0, Math.min(100, score));

  let label = 'Faible';
  if (score >= 70) label = 'Excellente';
  else if (score >= 45) label = 'Bonne';
  else if (score >= 25) label = 'Moyenne';

  return {
    score,
    label,
    details: {
      urgentKeywords: [],
      listingAge: null,
      priceAnalysis: null,
      photoAnalysis: null,
      legalStatus: null
    }
  };
}
