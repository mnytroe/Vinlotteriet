'use client'

import { useState, useEffect, useRef } from 'react'

interface Participant {
  id: number
  employeeId: number
  tickets: number
  employee: {
    id: number
    name: string
  }
}

interface WheelProps {
  participants: Participant[]
  onSpinComplete: (winner: Participant) => void
  spinning: boolean
  onSpinStart: () => void
}

export default function Wheel({
  participants,
  onSpinComplete,
  spinning,
  onSpinStart,
}: WheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const wheelRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>()

  // Expand participants based on tickets
  const expandedSegments = participants.flatMap((p) =>
    Array(p.tickets).fill(p)
  )

  const totalSegments = expandedSegments.length
  const segmentAngle = 360 / totalSegments

  // Randomize order
  const [randomizedSegments, setRandomizedSegments] = useState<Participant[]>(
    []
  )

  useEffect(() => {
    if (participants.length > 0) {
      randomizeSegments()
    }
  }, [participants])

  const randomizeSegments = () => {
    const expanded = participants.flatMap((p) => Array(p.tickets).fill(p))
    const shuffled = [...expanded].sort(() => Math.random() - 0.5)
    setRandomizedSegments(shuffled)
    // Also randomize starting position
    setRotation(Math.random() * 360)
  }

  const spin = () => {
    if (isSpinning || spinning) return

    setIsSpinning(true)
    onSpinStart()

    // Random rotation (multiple full turns + random final position)
    const spins = 5 + Math.random() * 5 // 5-10 full rotations
    const randomFinalAngle = Math.random() * 360
    const totalRotation = rotation + spins * 360 + randomFinalAngle

    const startTime = Date.now()
    const duration = 3000 // 3 seconds
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentRotation = startRotation + (totalRotation - startRotation) * easeOut

      setRotation(currentRotation)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Calculate winner
        const normalizedRotation = ((360 - (totalRotation % 360)) % 360) + 180
        const winningSegmentIndex = Math.floor(
          (normalizedRotation % 360) / segmentAngle
        ) % randomizedSegments.length
        const winner = randomizedSegments[winningSegmentIndex]

        setIsSpinning(false)
        if (winner) {
          setTimeout(() => {
            onSpinComplete(winner)
          }, 500)
        }
      }
    }

    animate()
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const getSegmentPath = (index: number, outerRadius: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)
    const innerRadius = 20

    const x1 = 250 + outerRadius * Math.cos(startAngle)
    const y1 = 250 + outerRadius * Math.sin(startAngle)
    const x2 = 250 + outerRadius * Math.cos(endAngle)
    const y2 = 250 + outerRadius * Math.sin(endAngle)

    const x3 = 250 + innerRadius * Math.cos(endAngle)
    const y3 = 250 + innerRadius * Math.sin(endAngle)
    const x4 = 250 + innerRadius * Math.cos(startAngle)
    const y4 = 250 + innerRadius * Math.sin(startAngle)

    return `M 250 250 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`
  }

  const getSegmentColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
      '#EC7063', '#5DADE2', '#58D68D', '#F4D03F', '#AF7AC5',
    ]
    return colors[index % colors.length]
  }

  const getSegmentLabel = (index: number) => {
    if (index >= randomizedSegments.length) return ''
    const participant = randomizedSegments[index]
    return participant.employee.name.substring(0, 10)
  }

  const getSegmentLabelPosition = (index: number, radius: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180)
    const labelRadius = radius * 0.7
    const x = 250 + labelRadius * Math.cos(angle)
    const y = 250 + labelRadius * Math.sin(angle)
    const rotation = (index + 0.5) * segmentAngle
    return { x, y, rotation }
  }

  if (randomizedSegments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Ingen deltakere valgt</p>
      </div>
    )
  }

  const outerRadius = 200

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          ref={wheelRef}
          width="500"
          height="500"
          className="transform transition-transform duration-75"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {randomizedSegments.map((_, index) => {
            const { x, y, rotation: labelRotation } = getSegmentLabelPosition(
              index,
              outerRadius
            )
            return (
              <g key={index}>
                <path
                  d={getSegmentPath(index, outerRadius)}
                  fill={getSegmentColor(index)}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white"
                  transform={`rotate(${labelRotation}, ${x}, ${y})`}
                  style={{
                    fontSize: '12px',
                    pointerEvents: 'none',
                  }}
                >
                  {getSegmentLabel(index)}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600"></div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={randomizeSegments}
          disabled={isSpinning || spinning}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Randomiser
        </button>
        <button
          onClick={spin}
          disabled={isSpinning || spinning || randomizedSegments.length === 0}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
        >
          {isSpinning ? 'Spinner...' : 'Spinn!'}
        </button>
      </div>
    </div>
  )
}
