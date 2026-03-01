'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Period = '1M' | '6M' | '1A' | 'Tout'

interface WealthChartProps {
  currentTotal: number
}

// Génère des données mock cohérentes avec le total actuel
function generateMockData(total: number, period: Period) {
  if (total === 0) total = 120000

  const now = Date.now()
  const cfg: Record<Period, { points: number; msStep: number; startRatio: number; fmt: Intl.DateTimeFormatOptions }> = {
    '1M':  { points: 30, msStep: 86_400_000,      startRatio: 0.96, fmt: { day: 'numeric', month: 'short' } },
    '6M':  { points: 26, msStep: 86_400_000 * 7,  startRatio: 0.91, fmt: { day: 'numeric', month: 'short' } },
    '1A':  { points: 12, msStep: 86_400_000 * 30, startRatio: 0.82, fmt: { month: 'short', year: '2-digit' } },
    'Tout':{ points: 24, msStep: 86_400_000 * 30, startRatio: 0.60, fmt: { month: 'short', year: '2-digit' } },
  }

  const { points, msStep, startRatio, fmt } = cfg[period]
  const start = total * startRatio

  return Array.from({ length: points + 1 }, (_, i) => {
    const date   = new Date(now - (points - i) * msStep)
    const trend  = start + ((total - start) * i) / points
    // bruit pseudo-aléatoire déterministe basé sur index
    const seed   = Math.sin(i * 9301 + 49297) * 0.5 + 0.5
    const noise  = (seed - 0.47) * total * 0.014
    const value  = Math.round(Math.max(trend + noise, start * 0.92))

    return {
      date: date.toLocaleDateString('fr-FR', fmt),
      value,
    }
  })
}

const fmtCompact = (v: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(v)

const fmtFull = (v: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-4 py-3 border font-mono text-xs"
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        borderColor: '#c9a84c33',
        color: 'var(--text-primary)',
      }}
    >
      <p className="mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ color: '#c9a84c' }}>{fmtFull(payload[0].value)}</p>
    </div>
  )
}

const PERIODS: Period[] = ['1M', '6M', '1A', 'Tout']

export default function WealthChart({ currentTotal }: WealthChartProps) {
  const [active, setActive] = useState<Period>('6M')

  const data = useMemo(
    () => generateMockData(currentTotal, active),
    [currentTotal, active],
  )

  return (
    <div
      className="p-6 border animate-fade-up-2"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-[10px] tracking-[0.28em] uppercase" style={{ color: 'var(--text-muted)' }}>
          Évolution du Capital
        </p>

        {/* Tabs */}
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className="px-3 py-1.5 text-[10px] tracking-widest transition-all duration-200"
              style={{
                backgroundColor: active === p ? '#c9a84c' : 'transparent',
                color:           active === p ? '#0a0a0a' : 'var(--text-muted)',
                border:          `1px solid ${active === p ? '#c9a84c' : 'var(--border)'}`,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#c9a84c" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtCompact}
              width={68}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#c9a84c22', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#c9a84c"
              strokeWidth={1.5}
              fill="url(#goldGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#c9a84c', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
