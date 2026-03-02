'use client'

import type { BudgetAlert } from '@/lib/budgetRules'

interface BudgetRuleAlertProps {
  alerts: BudgetAlert[]
}

export default function BudgetRuleAlert({ alerts }: BudgetRuleAlertProps) {
  if (!alerts.length) return null

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 text-[11px] font-mono tracking-wide border"
          style={{
            backgroundColor: alert.type === 'error'
              ? 'rgba(224,92,92,0.08)'
              : 'rgba(245,158,11,0.08)',
            borderColor: alert.type === 'error'
              ? 'rgba(224,92,92,0.3)'
              : 'rgba(245,158,11,0.3)',
            color: alert.type === 'error' ? '#e05c5c' : '#f59e0b',
          }}
        >
          {alert.type === 'error' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          {alert.message}
        </div>
      ))}
    </div>
  )
}
