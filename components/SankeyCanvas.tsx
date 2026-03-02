'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { MonthlyFlow } from '@/types/finance'

// ── Types internes ─────────────────────────────────────────────────────────────

interface CNode {
  id:    string
  label: string
  value: number
  x:     number
  y:     number
  w:     number
  h:     number
  color: string
}

interface Tooltip {
  x:     number
  y:     number
  label: string
  value: number
  pct:   number
  color: string
}

// ── Constantes de layout ───────────────────────────────────────────────────────

const NW  = 18  // node width (px)
const GAP = 5   // gap entre nœuds (px)
const PAD = 28  // padding haut/bas (px)
const H   = 500 // hauteur fixe du canvas

// ── Helpers ────────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, a: number): string {
  // Supporte les hex 3 ou 6 chiffres
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

function drawRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(3, w / 2, Math.max(h, 1) / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}

function drawLink(
  ctx:        CanvasRenderingContext2D,
  x0: number, y0t: number, y0b: number,
  x1: number, y1t: number, y1b: number,
  c0: string, c1: string,
) {
  const cp   = (x1 - x0) * 0.48
  const grad = ctx.createLinearGradient(x0, 0, x1, 0)
  grad.addColorStop(0, hexAlpha(c0, 0.28))
  grad.addColorStop(1, hexAlpha(c1, 0.28))

  ctx.beginPath()
  ctx.moveTo(x0, y0t)
  ctx.bezierCurveTo(x0 + cp, y0t, x1 - cp, y1t, x1, y1t)
  ctx.lineTo(x1, y1b)
  ctx.bezierCurveTo(x1 - cp, y1b, x0 + cp, y0b, x0, y0b)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
}

// ── Calcul des nœuds ───────────────────────────────────────────────────────────

function buildNodes(flow: MonthlyFlow, W: number): CNode[] {
  const nodes: CNode[] = []
  const total = flow.totalIncome
  const dh    = H - PAD * 2

  const cx = [W * 0.08, W * 0.33, W * 0.60, W * 0.84]

  // Col 0 — Sources de revenus
  let y = PAD
  for (const src of flow.sources) {
    const h = Math.max(8, (src.value / total) * dh)
    nodes.push({ id: `src:${src.label}`, label: src.label, value: src.value, x: cx[0], y, w: NW, h, color: src.color })
    y += h + GAP
  }

  // Col 1 — Budget central (pleine hauteur)
  nodes.push({ id: 'budget', label: 'Budget', value: total, x: cx[1], y: PAD, w: NW, h: dh, color: '#c9a84c' })

  // Col 2 — Catégories + surplus
  y = PAD
  const totalCat = flow.categories.reduce((s, c) => s + c.value, 0)
  const surplus  = Math.max(0, total - totalCat)

  for (const cat of flow.categories) {
    if (cat.value <= 0) continue
    const h = Math.max(8, (cat.value / total) * dh)
    nodes.push({ id: `cat:${cat.label}`, label: cat.label, value: cat.value, x: cx[2], y, w: NW, h, color: cat.color })
    y += h + GAP
  }
  if (surplus > 0) {
    const h = Math.max(8, (surplus / total) * dh)
    nodes.push({ id: 'surplus', label: 'Surplus', value: surplus, x: cx[2], y, w: NW, h, color: '#94a3b8' })
  }

  // Col 3 — Items par catégorie
  y = PAD
  for (const cat of flow.categories) {
    if (!cat.items?.length || cat.value <= 0) continue
    for (const item of cat.items) {
      if (item.value <= 0) continue
      const h = Math.max(6, (item.value / total) * dh)
      nodes.push({ id: `item:${cat.label}:${item.label}`, label: item.label, value: item.value, x: cx[3], y, w: NW, h, color: cat.color })
      y += h + GAP
    }
  }

  return nodes
}

// ── Composant ─────────────────────────────────────────────────────────────────

interface SankeyCanvasProps {
  flow: MonthlyFlow | null
}

export default function SankeyCanvas({ flow }: SankeyCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef     = useRef<CNode[]>([])
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const render = useCallback(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W   = container.clientWidth
    canvas.width  = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)

    if (!flow || flow.totalIncome === 0) {
      ctx.fillStyle = 'rgba(240,236,228,0.15)'
      ctx.font      = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Aucune donnée — cliquez sur "Saisir les données du mois"', W / 2, H / 2)
      return
    }

    const nodes  = buildNodes(flow, W)
    nodesRef.current = nodes

    const total      = flow.totalIncome
    const budgetNode = nodes.find(n => n.id === 'budget')!

    // ── Liens : Sources → Budget ──────────────────────────────────────────────
    let budgetY = budgetNode.y
    for (const src of flow.sources) {
      const srcNode = nodes.find(n => n.id === `src:${src.label}`)
      if (!srcNode) continue
      const lh = Math.max(2, (src.value / total) * budgetNode.h)
      drawLink(ctx, srcNode.x + NW, srcNode.y, srcNode.y + srcNode.h, budgetNode.x, budgetY, budgetY + lh, src.color, '#c9a84c')
      budgetY += lh + 1
    }

    // ── Liens : Budget → Catégories ──────────────────────────────────────────
    const catNodes = nodes.filter(n => n.id.startsWith('cat:') || n.id === 'surplus')
    let budgetY2   = budgetNode.y
    for (const catNode of catNodes) {
      const lh = Math.max(2, (catNode.value / total) * budgetNode.h)
      drawLink(ctx, budgetNode.x + NW, budgetY2, budgetY2 + lh, catNode.x, catNode.y, catNode.y + catNode.h, '#c9a84c', catNode.color)
      budgetY2 += lh + 1
    }

    // ── Liens : Catégories → Items ────────────────────────────────────────────
    for (const cat of flow.categories) {
      const catNode = nodes.find(n => n.id === `cat:${cat.label}`)
      if (!catNode || !cat.items?.length) continue
      let itemLinkY = catNode.y
      for (const item of cat.items) {
        if (item.value <= 0) continue
        const itemNode = nodes.find(n => n.id === `item:${cat.label}:${item.label}`)
        if (!itemNode) continue
        const lh = Math.max(2, (item.value / cat.value) * catNode.h)
        drawLink(ctx, catNode.x + NW, itemLinkY, itemLinkY + lh, itemNode.x, itemNode.y, itemNode.y + itemNode.h, cat.color, cat.color)
        itemLinkY += lh + 1
      }
    }

    // ── Nœuds ────────────────────────────────────────────────────────────────
    const isDark   = document.documentElement.classList.contains('dark')
    const textMain = isDark ? 'rgba(240,236,228,0.8)' : 'rgba(26,22,18,0.8)'
    const textSub  = isDark ? 'rgba(240,236,228,0.35)' : 'rgba(26,22,18,0.35)'
    const fmtN     = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)

    for (const node of nodes) {
      ctx.fillStyle = node.color
      drawRR(ctx, node.x, node.y, node.w, node.h)
      ctx.fill()

      const rightHalf = node.x > W * 0.5
      ctx.textAlign   = rightHalf ? 'right' : 'left'
      const lx        = rightHalf ? node.x - 9 : node.x + node.w + 9
      const cy        = node.y + node.h / 2

      if (node.h >= 18) {
        ctx.fillStyle = textMain
        ctx.font      = '500 10px "DM Mono", monospace'
        ctx.fillText(node.label, lx, cy + (node.h >= 32 ? -5 : 3))

        if (node.h >= 32) {
          ctx.fillStyle = textSub
          ctx.font      = '9px "DM Mono", monospace'
          const pct = ((node.value / total) * 100).toFixed(0)
          ctx.fillText(`${fmtN(node.value)} € · ${pct}%`, lx, cy + 8)
        }
      }
    }

    // ── Labels colonnes ───────────────────────────────────────────────────────
    const colLabels = ['Revenus', 'Budget', 'Catégories', 'Détail']
    const cx        = [W * 0.08, W * 0.33, W * 0.60, W * 0.84]
    ctx.textAlign   = 'left'
    ctx.fillStyle   = isDark ? 'rgba(240,236,228,0.18)' : 'rgba(26,22,18,0.18)'
    ctx.font        = '9px "DM Mono", monospace'
    colLabels.forEach((lbl, i) => {
      ctx.fillText(lbl.toUpperCase(), cx[i], PAD - 10)
    })

  }, [flow])

  useEffect(() => {
    render()
    const ro = new ResizeObserver(render)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [render])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx   = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my   = (e.clientY - rect.top)  * (canvas.height / rect.height)
    const total = flow?.totalIncome ?? 0

    const hit = nodesRef.current.find(
      n => mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h,
    )
    if (hit && total > 0) {
      setTooltip({ x: e.clientX - rect.left, y: hit.y, label: hit.label, value: hit.value, pct: (hit.value / total) * 100, color: hit.color })
    } else {
      setTooltip(null)
    }
  }, [flow])

  const fmtFull = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ cursor: tooltip ? 'crosshair' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />

      {tooltip && (
        <div
          className="absolute pointer-events-none border px-3 py-2.5 text-xs font-mono z-10"
          style={{
            left:            tooltip.x + 14,
            top:             tooltip.y,
            backgroundColor: 'var(--bg2, #111)',
            borderColor:     hexAlpha(tooltip.color, 0.4),
            color:           'var(--text, #f0ece4)',
            minWidth:        140,
          }}
        >
          <div className="font-medium mb-1" style={{ color: tooltip.color }}>{tooltip.label}</div>
          <div className="mb-0.5">{fmtFull(tooltip.value)}</div>
          <div style={{ color: 'var(--text2, rgba(240,236,228,0.4))' }}>{tooltip.pct.toFixed(1)}% du revenu</div>
        </div>
      )}
    </div>
  )
}
