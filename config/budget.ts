// Règles budgétaires personnelles d'Arthur Arenal
export const BUDGET = {
  // Cibles (% du revenu total)
  fixedChargesTarget:  0.55,   // 55% pour logement + transport + alimentation
  fixedChargesMax:     0.60,   // alerte si > 60%
  pleasuresTarget:     0.05,   // 5% pour loisirs

  // Répartition du surplus
  surplusSavingsRatio: 0.66,   // 2/3 → épargne
  surplusInvestRatio:  0.33,   // 1/3 → investissement

  // Charges fixes connues
  loyer: 890,
} as const

// Catégories fixes et leurs couleurs
export const CATEGORIES = [
  { label: 'Logement',       color: '#7eb8f7', type: 'fixed'    as const },
  { label: 'Transport',      color: '#93c5fd', type: 'fixed'    as const },
  { label: 'Alimentation',   color: '#a78bfa', type: 'fixed'    as const },
  { label: 'Santé',          color: '#f9a8d4', type: 'fixed'    as const },
  { label: 'Abonnements',    color: '#f59e0b', type: 'fixed'    as const },
  { label: 'Loisirs',        color: '#f87171', type: 'pleasure' as const },
  { label: 'Famille',        color: '#fb923c', type: 'pleasure' as const },
  { label: 'Vacances',       color: '#38bdf8', type: 'expense'  as const },
  { label: 'Épargne & Invest', color: '#c9a84c', type: 'savings' as const },
] as const

export type CategoryLabel = (typeof CATEGORIES)[number]['label']
