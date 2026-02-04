'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ConfidenceGaugeProps {
  value: number // 0-100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  outcome?: string
  animated?: boolean
}

export function ConfidenceGauge({
  value,
  label = 'Confidence',
  size = 'md',
  outcome,
  animated = true,
}: ConfidenceGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }

    // Animate from 0 to value
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animated])

  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: 'text-xl' },
    md: { width: 180, stroke: 12, fontSize: 'text-3xl' },
    lg: { width: 240, stroke: 16, fontSize: 'text-5xl' },
  }

  const { width, stroke, fontSize } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = radius * Math.PI // Half circle
  const progress = (displayValue / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 80) return { stroke: '#22c55e', text: 'text-green-500' } // Green
    if (val >= 60) return { stroke: '#eab308', text: 'text-yellow-500' } // Yellow
    if (val >= 40) return { stroke: '#f97316', text: 'text-orange-500' } // Orange
    return { stroke: '#ef4444', text: 'text-red-500' } // Red
  }

  const color = getColor(displayValue)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width / 2 + 20 }}>
        <svg
          width={width}
          height={width / 2 + 20}
          viewBox={`0 0 ${width} ${width / 2 + 20}`}
          className="transform -rotate-0"
        >
          {/* Background arc */}
          <path
            d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/30"
          />

          {/* Progress arc */}
          <path
            d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
            fill="none"
            stroke={color.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180
            const radian = (angle * Math.PI) / 180
            const x1 = width / 2 + (radius - stroke / 2 - 4) * Math.cos(Math.PI - radian)
            const y1 = width / 2 - (radius - stroke / 2 - 4) * Math.sin(Math.PI - radian)
            const x2 = width / 2 + (radius - stroke / 2 + 4) * Math.cos(Math.PI - radian)
            const y2 = width / 2 - (radius - stroke / 2 + 4) * Math.sin(Math.PI - radian)

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground/50"
              />
            )
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={cn(fontSize, 'font-bold', color.text)}>
            {displayValue}%
          </span>
          {outcome && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {outcome}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-sm text-muted-foreground mt-2">{label}</span>
      )}
    </div>
  )
}

// Breakdown bar chart for factors
interface FactorBreakdownProps {
  factors: Array<{
    name: string
    value: number // 0-100
    favors: 'plaintiff' | 'defendant' | 'neutral'
  }>
}

export function FactorBreakdown({ factors }: FactorBreakdownProps) {
  const favorColors = {
    plaintiff: 'bg-blue-500',
    defendant: 'bg-amber-500',
    neutral: 'bg-gray-400',
  }

  return (
    <div className="space-y-3">
      {factors.map((factor, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium truncate mr-2">{factor.name}</span>
            <span className={cn(
              'text-xs',
              factor.favors === 'plaintiff' ? 'text-blue-500' :
              factor.favors === 'defendant' ? 'text-amber-500' :
              'text-gray-500'
            )}>
              {factor.favors === 'neutral' ? '—' : factor.favors}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                favorColors[factor.favors]
              )}
              style={{ width: `${factor.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Outcome probability bars (plaintiff vs defendant)
interface OutcomeBarsProps {
  plaintiffProbability: number
  defendantProbability: number
  plaintiffName?: string
  defendantName?: string
}

export function OutcomeBars({
  plaintiffProbability,
  defendantProbability,
  plaintiffName = 'Plaintiff',
  defendantName = 'Defendant',
}: OutcomeBarsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-500">{plaintiffName}</span>
          <span className="text-sm font-bold text-blue-500">{plaintiffProbability}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${plaintiffProbability}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-500">{defendantName}</span>
          <span className="text-sm font-bold text-amber-500">{defendantProbability}%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-1000"
            style={{ width: `${defendantProbability}%` }}
          />
        </div>
      </div>
    </div>
  )
}
