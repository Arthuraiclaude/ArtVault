import type { Timestamp } from 'firebase/firestore'

export interface Asset {
  id:        string
  name:      string
  category:  'liquidites' | 'investissements' | 'actifs'
  amount:    number
  currency:  string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface FlowSource {
  label: string
  value: number
  color: string
}

export interface FlowItem {
  label: string
  value: number
}

export interface FlowCategory {
  label: string
  color:  string
  value:  number
  items:  FlowItem[]
}

export interface BudgetRules {
  fixedChargesTarget: number
  pleasuresTarget:    number
  surplusSavingsRatio: number
  surplusInvestRatio:  number
}

export interface MonthlyFlow {
  month:       number
  year:        number
  totalIncome: number
  sources:     FlowSource[]
  categories:  FlowCategory[]
  budgetRules: BudgetRules
  createdAt:   Timestamp
  updatedAt:   Timestamp
}

export interface WealthSnapshot {
  date:            Timestamp
  netWorth:        number
  liquidites:      number
  investissements: number
  actifs:          number
}
