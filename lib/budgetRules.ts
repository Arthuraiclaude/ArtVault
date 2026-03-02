import type { MonthlyFlow } from '@/types/finance'
import { BUDGET } from '@/config/budget'

export interface BudgetAlert {
  type:      'error' | 'warning'
  message:   string
  category?: string
}

const FIXED_LABELS    = ['Logement', 'Transport', 'Alimentation', 'Santé', 'Abonnements']
const PLEASURE_LABELS = ['Loisirs', 'Famille']

export function computeAlerts(flow: MonthlyFlow): BudgetAlert[] {
  const alerts: BudgetAlert[] = []
  const { totalIncome, categories } = flow
  if (totalIncome === 0) return alerts

  const sum = (labels: string[]) =>
    categories.filter(c => labels.includes(c.label)).reduce((s, c) => s + c.value, 0)

  const fixedTotal    = sum(FIXED_LABELS)
  const pleasureTotal = sum(PLEASURE_LABELS)

  const fixedRatio    = fixedTotal    / totalIncome
  const pleasureRatio = pleasureTotal / totalIncome

  if (fixedRatio > BUDGET.fixedChargesMax) {
    alerts.push({
      type:    'error',
      message: `Charges fixes à ${(fixedRatio * 100).toFixed(0)}% du revenu — cible ≤ ${(BUDGET.fixedChargesMax * 100).toFixed(0)}%`,
    })
  } else if (fixedRatio > BUDGET.fixedChargesTarget) {
    alerts.push({
      type:    'warning',
      message: `Charges fixes à ${(fixedRatio * 100).toFixed(0)}% du revenu — cible ${(BUDGET.fixedChargesTarget * 100).toFixed(0)}%`,
    })
  }

  if (pleasureRatio > BUDGET.pleasuresTarget) {
    alerts.push({
      type:    'warning',
      message: `Loisirs à ${(pleasureRatio * 100).toFixed(0)}% du revenu — cible ≤ ${(BUDGET.pleasuresTarget * 100).toFixed(0)}%`,
      category: 'pleasure',
    })
  }

  return alerts
}

export function computeSurplus(flow: MonthlyFlow): number {
  const totalExpenses = flow.categories.reduce((s, c) => s + c.value, 0)
  return Math.max(0, flow.totalIncome - totalExpenses)
}

export function categoryRatio(flow: MonthlyFlow, label: string): number {
  if (flow.totalIncome === 0) return 0
  const cat = flow.categories.find(c => c.label === label)
  return cat ? cat.value / flow.totalIncome : 0
}
