'use client'

import { useState, useMemo } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Sidebar   from '@/components/Sidebar'

// ── DATA ──────────────────────────────────────────────────────────────────────

const MONTHS = ['Oct 2025', 'Nov 2025', 'Déc 2025', 'Jan 2026', 'Fév 2026']

const REVENUES: Record<string, number>[] = [
  { SNCF: 2355.44, Temporis: 320.74, Jeanne: 200, CAF: 55.35 },
  { SNCF: 2257.29, Jeanne: 200 },
  { SNCF: 2920.48, Jeanne: 200, 'Remb. Admiral': 62.39 },
  { SNCF: 2473.69, Jeanne: 200, CAF: 122.82 },
  { SNCF: 2045.07, Jeanne: 350, CAF: 357.91 },
]

const DEPENSES: Record<string, number>[] = [
  { Logement: 900.60, Alimentation: 608.45, Loisirs: 291.06, Transport: 45.84, 'Invest. ext.': 200, Assurance: 60.10, Abonnements: 124.06, Divers: 19.75 },
  { Logement: 902.30, Alimentation: 370.30, 'Invest. ext.': 350, Assurance: 336.30, Loisirs: 163.69, 'Invest. fam.': 150, Abonnements: 71.09, Transport: 67.53, Divers: 61.57 },
  { Logement: 926.97, 'Invest. ext.': 820, Alimentation: 630.55, Loisirs: 403.61, 'Crédit auto': 271.73, Transport: 268.50, 'Invest. fam.': 150, Abonnements: 89.97, Divers: 51.65, Assurance: 36.74 },
  { Logement: 890, Alimentation: 498.01, Assurance: 254.51, Divers: 181.55, Loisirs: 178.51, 'Invest. fam.': 150, Transport: 118.93, 'Invest. ext.': 100, Abonnements: 73.97 },
  { Logement: 890, Alimentation: 556.77, Loisirs: 312.38, Investissement: 200, Assurance: 162.47, Transport: 84.76, Santé: 53.65, Abonnements: 48.97, Divers: 30 },
]

type EpargneEntry = { delta: number; from: number; to: number }
const EPARGNE: Record<string, EpargneEntry>[] = [
  { 'Cash Reserve': { delta: 24.44,  from: 7.23,   to: 31.67   }, 'Livret A': { delta: 0,   from: 12.17,  to: 12.17  } },
  { 'Cash Reserve': { delta: 525.66, from: 31.67,  to: 557.33  }, 'Livret A': { delta: 250, from: 12.17,  to: 262.17 } },
  { 'Cash Reserve': { delta: 195.42, from: 557.33, to: 752.75  }, 'Livret A': { delta: 500, from: 262.17, to: 762.17 } },
  { 'Cash Reserve': { delta: 161.06, from: 752.75, to: 913.81  }, 'Livret A': { delta: 100, from: 762.17, to: 862.17 } },
  { 'Cash Reserve': { delta: 137.50, from: 913.81, to: 1051.31 }, 'Livret A': { delta: 0,   from: 862.17, to: 862.17 } },
]

const NOTES: (string | null)[] = [
  null,
  'Ornikar 300€ assurance annuelle + Investissement 500€',
  'Investissement 820€ + Crédit auto DIAC 272€ + cadeaux',
  'MAIF 104€ prime annuelle incluse · Assurance total 255€',
  'CAF double (janv+fév) = +358€ revenus',
]

const CAT_COLORS: Record<string, string> = {
  Logement:       '#60a5fa',
  Alimentation:   '#4ade80',
  Loisirs:        '#c084fc',
  Transport:      '#fb923c',
  'Invest. ext.': '#c9a84c',
  'Invest. fam.': '#fbbf24',
  Investissement: '#fbbf24',
  Assurance:      '#f87171',
  Abonnements:    '#2dd4bf',
  Santé:          '#f472b6',
  'Crédit auto':  '#a78bfa',
  Divers:         '#94a3b8',
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function sum(obj: Record<string, number>) {
  return Object.values(obj).reduce((a, b) => a + b, 0)
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + '\u202f€'
}

// ── SANKEY ────────────────────────────────────────────────────────────────────

function SankeyChart({
  revenues,
  depenses,
}: {
  revenues: Record<string, number>
  depenses: Record<string, number>
}) {
  const W = 680
  const NODE_W   = 118
  const RIGHT_W  = 130
  const CENTER_W = 100
  const CURVE_GAP = 76
  const PAD_X    = 16
  const PAD_Y    = 24
  const NODE_H   = 26
  const NODE_GAP_L = 8
  const NODE_GAP_R = 6

  const revEntries = Object.entries(revenues).sort((a, b) => b[1] - a[1])
  const depEntries = Object.entries(depenses).sort((a, b) => b[1] - a[1])
  const totalRev   = sum(revenues)
  const totalDep   = sum(depenses)

  // Heights
  const leftBlockH  = revEntries.length * NODE_H + (revEntries.length - 1) * NODE_GAP_L
  const rightBlockH = depEntries.length * NODE_H + (depEntries.length - 1) * NODE_GAP_R
  const centerH     = Math.max(leftBlockH, rightBlockH, 80)
  const H           = Math.max(leftBlockH, rightBlockH) + 2 * PAD_Y

  // X positions
  const leftX   = PAD_X
  const centerX = PAD_X + NODE_W + CURVE_GAP
  const rightX  = centerX + CENTER_W + CURVE_GAP

  // Y positions
  const leftStartY   = (H - leftBlockH)  / 2
  const rightStartY  = (H - rightBlockH) / 2
  const centerStartY = (H - centerH)     / 2

  // Left nodes
  const leftNodes = revEntries.map(([name, val], i) => ({
    name, val,
    x: leftX,
    y: leftStartY + i * (NODE_H + NODE_GAP_L),
  }))

  // Right nodes
  const rightNodes = depEntries.map(([name, val], i) => ({
    name, val,
    x: rightX,
    y: rightStartY + i * (NODE_H + NODE_GAP_R),
    color: CAT_COLORS[name] ?? '#94a3b8',
  }))

  // Distribute paths along left edge of center node
  let leftOffset = 0
  const leftPaths = revEntries.map(([, val], i) => {
    const frac = val / totalRev
    const thick = Math.max(3, frac * (centerH - (revEntries.length - 1) * 2))
    const enterY = centerStartY + leftOffset + thick / 2
    leftOffset += thick + 2
    const node = leftNodes[i]
    const x0 = node.x + NODE_W
    const y0 = node.y + NODE_H / 2
    const x1 = centerX
    const y1 = enterY
    const mx = (x0 + x1) / 2
    return { x0, y0, x1, y1, mx, thick }
  })

  // Distribute paths along right edge of center node
  let rightOffset = 0
  const rightPaths = depEntries.map(([, val], i) => {
    const frac = val / totalDep
    const thick = Math.max(3, frac * (centerH - (depEntries.length - 1) * 2))
    const exitY = centerStartY + rightOffset + thick / 2
    rightOffset += thick + 2
    const node = rightNodes[i]
    const x0 = centerX + CENTER_W
    const y0 = exitY
    const x1 = node.x
    const y1 = node.y + NODE_H / 2
    const mx = (x0 + x1) / 2
    return { x0, y0, x1, y1, mx, thick, color: node.color }
  })

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* Left paths */}
      {leftPaths.map((p, i) => (
        <path
          key={i}
          d={`M${p.x0},${p.y0} C${p.mx},${p.y0} ${p.mx},${p.y1} ${p.x1},${p.y1}`}
          fill="none"
          stroke="rgba(201,168,76,0.22)"
          strokeWidth={p.thick}
          strokeLinecap="round"
        />
      ))}

      {/* Right paths */}
      {rightPaths.map((p, i) => (
        <path
          key={i}
          d={`M${p.x0},${p.y0} C${p.mx},${p.y0} ${p.mx},${p.y1} ${p.x1},${p.y1}`}
          fill="none"
          stroke={p.color + '44'}
          strokeWidth={p.thick}
          strokeLinecap="round"
        />
      ))}

      {/* Left nodes */}
      {leftNodes.map((node, i) => (
        <g key={i}>
          <rect
            x={node.x} y={node.y}
            width={NODE_W} height={NODE_H}
            fill="#1a1a1a"
            stroke="rgba(201,168,76,0.25)"
            strokeWidth="1"
            rx="1"
          />
          <text
            x={node.x + NODE_W / 2}
            y={node.y + NODE_H / 2 - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#c9a84c"
            fontSize="8"
            fontFamily="DM Mono, monospace"
            letterSpacing="0.8"
          >
            {node.name}
          </text>
          <text
            x={node.x + NODE_W / 2}
            y={node.y + NODE_H / 2 + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(240,236,228,0.55)"
            fontSize="8"
            fontFamily="DM Mono, monospace"
          >
            {fmt(node.val)}
          </text>
        </g>
      ))}

      {/* Center node */}
      <rect
        x={centerX} y={centerStartY}
        width={CENTER_W} height={centerH}
        fill="#111111"
        stroke="#c9a84c"
        strokeWidth="1"
        rx="1"
      />
      <text
        x={centerX + CENTER_W / 2}
        y={H / 2 - 7}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#c9a84c"
        fontSize="8"
        fontFamily="DM Mono, monospace"
        letterSpacing="1.5"
      >
        REVENUS
      </text>
      <text
        x={centerX + CENTER_W / 2}
        y={H / 2 + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#f0ece4"
        fontSize="11"
        fontFamily="DM Mono, monospace"
      >
        {fmt(totalRev)}
      </text>
      <text
        x={centerX + CENTER_W / 2}
        y={H / 2 + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(240,236,228,0.3)"
        fontSize="7.5"
        fontFamily="DM Mono, monospace"
      >
        dep. {fmt(totalDep)}
      </text>

      {/* Right nodes */}
      {rightNodes.map((node, i) => (
        <g key={i}>
          <rect
            x={node.x} y={node.y}
            width={RIGHT_W} height={NODE_H}
            fill="#1a1a1a"
            stroke={node.color + '50'}
            strokeWidth="1"
            rx="1"
          />
          <text
            x={node.x + 7}
            y={node.y + NODE_H / 2 + 1}
            textAnchor="start"
            dominantBaseline="middle"
            fill={node.color}
            fontSize="7.5"
            fontFamily="DM Mono, monospace"
          >
            {node.name}
          </text>
          <text
            x={node.x + RIGHT_W - 7}
            y={node.y + NODE_H / 2 + 1}
            textAnchor="end"
            dominantBaseline="middle"
            fill="rgba(240,236,228,0.5)"
            fontSize="7.5"
            fontFamily="DM Mono, monospace"
          >
            {fmt(node.val)}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── TREND CHART ───────────────────────────────────────────────────────────────

function TrendChart({ activeMonth }: { activeMonth: number }) {
  const W  = 640
  const H  = 200
  const PL = 58, PR = 20, PT = 20, PB = 28

  const allRevs = REVENUES.map(r => sum(r))
  const allDeps = DEPENSES.map(d => sum(d))
  const allVals = [...allRevs, ...allDeps]
  const maxVal  = Math.max(...allVals)
  const minVal  = Math.min(...allVals) * 0.88

  const chartW = W - PL - PR
  const chartH = H - PT - PB
  const xStep  = chartW / 4

  const xPos   = (i: number) => PL + i * xStep
  const yScale = (v: number) => PT + chartH * (1 - (v - minVal) / (maxVal - minVal))

  const revPts = allRevs.map((v, i) => `${xPos(i)},${yScale(v)}`).join(' ')
  const depPts = allDeps.map((v, i) => `${xPos(i)},${yScale(v)}`).join(' ')

  const gridVals = [0.25, 0.5, 0.75].map(t => minVal + (1 - t) * (maxVal - minVal))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Grid */}
      {gridVals.map((val, i) => {
        const y = yScale(val)
        return (
          <g key={i}>
            <line
              x1={PL} y1={y} x2={W - PR} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={PL - 6} y={y + 4}
              textAnchor="end"
              fill="rgba(240,236,228,0.25)"
              fontSize="8"
              fontFamily="DM Mono, monospace"
            >
              {fmt(val)}
            </text>
          </g>
        )
      })}

      {/* Month labels */}
      {MONTHS.map((m, i) => (
        <text
          key={i}
          x={xPos(i)} y={H - 4}
          textAnchor="middle"
          fill={i === activeMonth ? '#c9a84c' : 'rgba(240,236,228,0.25)'}
          fontSize="8"
          fontFamily="DM Mono, monospace"
        >
          {m.split(' ')[0]}
        </text>
      ))}

      {/* Area fills */}
      <polyline
        points={revPts}
        fill="none"
        stroke="#4caf7d"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <polyline
        points={depPts}
        fill="none"
        stroke="#e05c5c"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Dots */}
      {allRevs.map((v, i) => (
        <circle
          key={i}
          cx={xPos(i)} cy={yScale(v)}
          r={i === activeMonth ? 5 : 3}
          fill={i === activeMonth ? '#c9a84c' : '#4caf7d'}
          stroke={i === activeMonth ? '#0a0a0a' : 'none'}
          strokeWidth="1.5"
        />
      ))}
      {allDeps.map((v, i) => (
        <circle
          key={i}
          cx={xPos(i)} cy={yScale(v)}
          r={i === activeMonth ? 5 : 3}
          fill={i === activeMonth ? '#c9a84c' : '#e05c5c'}
          stroke={i === activeMonth ? '#0a0a0a' : 'none'}
          strokeWidth="1.5"
        />
      ))}

      {/* Legend */}
      <line x1={W - 118} y1={PT + 10} x2={W - 106} y2={PT + 10} stroke="#4caf7d" strokeWidth="2" />
      <text x={W - 102} y={PT + 14} fill="rgba(240,236,228,0.4)" fontSize="8" fontFamily="DM Mono, monospace">
        Revenus
      </text>
      <line x1={W - 118} y1={PT + 24} x2={W - 106} y2={PT + 24} stroke="#e05c5c" strokeWidth="2" />
      <text x={W - 102} y={PT + 28} fill="rgba(240,236,228,0.4)" fontSize="8" fontFamily="DM Mono, monospace">
        Dépenses
      </text>
    </svg>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [activeMonth, setActiveMonth] = useState(4)

  const revenues = REVENUES[activeMonth]
  const depenses = DEPENSES[activeMonth]
  const epargne  = EPARGNE[activeMonth]
  const note     = NOTES[activeMonth]

  const totalRev    = useMemo(() => sum(revenues), [revenues])
  const totalDep    = useMemo(() => sum(depenses), [depenses])
  const solde       = totalRev - totalDep
  const totalEpargne = (epargne['Cash Reserve']?.delta ?? 0) + (epargne['Livret A']?.delta ?? 0)
  const cashReserve  = epargne['Cash Reserve']?.to ?? 0

  const sortedDep = Object.entries(depenses).sort((a, b) => b[1] - a[1])
  const maxDep    = sortedDep[0]?.[1] ?? 1

  const kpis = [
    { label: 'Revenus',      value: fmt(totalRev),                                       color: '#4caf7d'      },
    { label: 'Dépenses',     value: fmt(totalDep),                                       color: '#e05c5c'      },
    { label: 'Solde',        value: (solde >= 0 ? '+' : '') + fmt(solde),                color: solde >= 0 ? '#4caf7d' : '#e05c5c' },
    { label: 'Épargne',      value: '+' + fmt(totalEpargne),                             color: '#c9a84c'      },
    { label: 'Cash Reserve', value: fmt(cashReserve),                                    color: 'var(--text)'  },
  ]

  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">

          {/* Page header */}
          <div
            className="border-b flex items-center justify-between px-8 py-5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg2)' }}
          >
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase mb-1" style={{ color: 'var(--text2)' }}>
                Budget
              </p>
              <h1
                className="font-serif text-xl font-light tracking-[0.12em]"
                style={{ color: 'var(--text)' }}
              >
                Flux Mensuels
              </h1>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase hidden md:block" style={{ color: 'var(--text2)' }}>
              Sumeria + LCL · Oct 2025 – Fév 2026
            </p>
          </div>

          <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 space-y-8">

            {/* Month selector */}
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMonth(i)}
                  className="px-4 py-2 text-[10px] tracking-[0.25em] uppercase border transition-all duration-200"
                  style={{
                    borderColor:     i === activeMonth ? '#c9a84c' : 'var(--border)',
                    color:           i === activeMonth ? '#c9a84c' : 'var(--text2)',
                    backgroundColor: i === activeMonth ? 'rgba(201,168,76,0.08)' : 'transparent',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* KPI cards */}
            <div
              className="grid grid-cols-2 md:grid-cols-5 gap-px border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--border)' }}
            >
              {kpis.map((kpi, i) => (
                <div key={i} className="px-5 py-6" style={{ backgroundColor: 'var(--bg2)' }}>
                  <p
                    className="text-[9px] tracking-[0.3em] uppercase mb-3"
                    style={{ color: 'var(--text2)' }}
                  >
                    {kpi.label}
                  </p>
                  <p
                    className="font-mono text-lg font-light"
                    style={{ color: kpi.color }}
                  >
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Note contextuelle */}
            {note && (
              <div
                className="border-l-2 px-5 py-3"
                style={{
                  borderColor:     '#c9a84c',
                  backgroundColor: 'rgba(201,168,76,0.05)',
                }}
              >
                <p className="text-[11px] tracking-[0.1em] leading-relaxed" style={{ color: 'var(--text2)' }}>
                  <span style={{ color: '#c9a84c' }}>Note · </span>{note}
                </p>
              </div>
            )}

            {/* Sankey */}
            <div
              className="border p-6"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg2)' }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-6"
                style={{ color: 'var(--text2)' }}
              >
                Flux de revenus → dépenses
              </p>
              <SankeyChart revenues={revenues} depenses={depenses} />
            </div>

            {/* Sources + Bar chart */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-px border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--border)' }}
            >
              {/* Sources de revenus + Épargne */}
              <div className="p-6" style={{ backgroundColor: 'var(--bg2)' }}>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-5"
                  style={{ color: 'var(--text2)' }}
                >
                  Sources de revenus
                </p>

                <div className="space-y-3">
                  {Object.entries(revenues)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, val]) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            style={{ width: 2, height: 14, backgroundColor: '#c9a84c', flexShrink: 0 }}
                          />
                          <span
                            className="text-[11px] tracking-[0.08em]"
                            style={{ color: 'var(--text2)' }}
                          >
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className="text-[10px] font-mono tabular-nums"
                            style={{ color: 'var(--text3)' }}
                          >
                            {((val / totalRev) * 100).toFixed(0)}%
                          </span>
                          <span
                            className="text-[12px] font-mono tabular-nums"
                            style={{ color: 'var(--text)' }}
                          >
                            {fmt(val)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Divider */}
                <div
                  className="my-5"
                  style={{ height: 1, backgroundColor: 'var(--border)' }}
                />

                {/* Épargne */}
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-4"
                  style={{ color: 'var(--text2)' }}
                >
                  Épargne constituée
                </p>
                <div className="space-y-2.5">
                  {Object.entries(epargne).map(([name, data]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span
                        className="text-[11px] tracking-[0.08em]"
                        style={{ color: 'var(--text2)' }}
                      >
                        {name}
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-[10px] font-mono tabular-nums"
                          style={{ color: data.delta > 0 ? '#4caf7d' : 'var(--text3)' }}
                        >
                          {data.delta > 0 ? '+' : ''}{fmt(data.delta)}
                        </span>
                        <span
                          className="text-[12px] font-mono tabular-nums"
                          style={{ color: 'var(--text)' }}
                        >
                          {fmt(data.to)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar chart dépenses */}
              <div className="p-6" style={{ backgroundColor: 'var(--bg2)' }}>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mb-5"
                  style={{ color: 'var(--text2)' }}
                >
                  Répartition des dépenses
                </p>
                <div className="space-y-3">
                  {sortedDep.map(([name, val]) => {
                    const color = CAT_COLORS[name] ?? '#94a3b8'
                    const pct   = (val / maxDep) * 100
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[10px] tracking-[0.08em]"
                            style={{ color: 'var(--text2)' }}
                          >
                            {name}
                          </span>
                          <span
                            className="text-[11px] font-mono tabular-nums"
                            style={{ color: 'var(--text)' }}
                          >
                            {fmt(val)}
                          </span>
                        </div>
                        <div
                          style={{
                            height:          3,
                            backgroundColor: 'var(--bg3)',
                            borderRadius:    2,
                          }}
                        >
                          <div
                            style={{
                              width:           `${pct}%`,
                              height:          '100%',
                              backgroundColor: color,
                              borderRadius:    2,
                              transition:      'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Trend chart */}
            <div
              className="border p-6"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg2)' }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-6"
                style={{ color: 'var(--text2)' }}
              >
                Évolution sur 5 mois
              </p>
              <TrendChart activeMonth={activeMonth} />
            </div>

          </main>

          <footer
            className="border-t px-8 py-5 text-center text-[10px] tracking-[0.3em] uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
          >
            ArtVault — {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </AuthGuard>
  )
}
